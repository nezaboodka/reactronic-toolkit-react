// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Cache, isolated, trigger } from 'reactronic'

// Apply, Node, Rtti, Linker

export type Apply<E = unknown> = (element: E) => void

export interface Node<E = unknown> {
  readonly id: string
  readonly apply: Apply<E>
  readonly rtti: Rtti<E>
  linker?: Linker<E>
}

export interface Rtti<E = unknown> {
  readonly name: string
  readonly reactive: boolean
  apply?(self: Node<E>): void
  mount?(self: Node<E>, outer: Node, after?: Node): void
  ordering?(self: Node<E>, outer: Node, after?: Node): void
  unmount?(self: Node<E>, outer: Node): void
}

export interface Linker<E = void> {
  readonly level: number
  element?: E
  index: Array<Node> // sorted children
  pending?: Array<Node> // children in natural order
  reactiveApply(self: Node<E>): void
}

// fragment, apple, applyChildren

export function fragment<E = unknown>(id: string, apply: Apply<E>, rtti?: Rtti<E>): void {
  const self: Node<any> = { id, apply, rtti: rtti || LinkerImpl.global.rtti }
  // console.log(`< defining: <${node.rtti.name}> #${node.id}...`)
  const outer = LinkerImpl.current // shorthand
  const linker = outer.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (outer !== LinkerImpl.global) {
    if (!linker.pending)
      throw new Error('children are applied already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    linker.pending.push(self)
  }
  else { // apply root immediately
    linker.pending = [self]
    applyChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function applyChildren(): void {
  // console.log(`applying children: <${self.rtti.name}> #${self.id}`)
  reconcile(LinkerImpl.current)
  // console.log(`applied children: <${self.rtti.name}> #${self.id}`)
}

export function apply(self: Node<any>): void {
  const outer = LinkerImpl.current
  try {
    LinkerImpl.current = self
    const linker = self.linker
    if (!linker)
      throw new Error('node must be mounted before rendering')
    linker.pending = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.apply(linker.element!)
    applyChildren() // ignored if applied already
  }
  finally {
    LinkerImpl.current = outer
  }
}

// Internal

class LinkerImpl<E = unknown> implements Linker<E> {
  level: number
  element?: E
  index: Node[] = []
  pending?: Node[]

  constructor(level: number) {
    this.level = level
  }

  @trigger
  reactiveApply(self: Node<E>): void {
    basicApply(self)
  }

  static global: Node = {
    id: '<global>',
    apply: () => { /* nop */ },
    rtti: { name: '<default>', reactive: false },
    linker: new LinkerImpl(0)
  }
  static current: Node = LinkerImpl.global
}

function basicApply<E>(self: Node<E>): void {
  if (self.rtti.apply)
    self.rtti.apply(self)
  else
    apply(self)
}

function reconcile(self: Node): void {
  const linker = self.linker
  const children = linker?.pending
  if (linker && children) {
    linker.pending = undefined
    const nextIndex = children.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    isolated(() => {
      let i = 0, j = 0
      while (i < linker.index.length) {
        const a = linker.index[i]
        const b = nextIndex[j]
        if (!b || a.id < b.id) { // then unmount
          if (a.rtti.unmount)
            a.rtti.unmount(a, self) // TODO: mitigate the risk of exception
          if (a.rtti.reactive)
            Cache.unmount(a.linker)
          a.linker = undefined
          i++
        }
        else if (a.id === b.id) { // then preserve
          b.linker = a.linker
          i++, j++
        }
        else // will mount
          j++
      }
      let prev: Node | undefined = undefined
      for (const x of children) {
        if (!x.linker) { // then mount
          const xLinker = new LinkerImpl(linker.level + 1)
          Cache.of(xLinker.reactiveApply).setup({ priority: xLinker.level })
          x.linker = xLinker
          if (x.rtti.mount)
            x.rtti.mount(x, self, prev)
        }
        else if (x.rtti.ordering) // then re-order if needed
          x.rtti.ordering(x, self, prev)
        // Apply
        if (x.rtti.reactive)
          x.linker.reactiveApply(x)
        else
          basicApply(x)
        prev = x
      }
    })
    linker.index = nextIndex
  }
}
