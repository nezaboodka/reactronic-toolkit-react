// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Cache, isolated, trigger } from 'reactronic'

// Apply, Node, Rtti, Linker

export type Apply<E = void> = (element: E) => void

export interface Node<E = void> {
  readonly id: string
  readonly apply: Apply<E>
  readonly rtti: Rtti<E>
  linker?: Linker<E>
}

export interface Rtti<E = void> {
  readonly name: string
  readonly reactive: boolean
  proceed?(node: Node<E>): void
  mount?(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void
  ordering?(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, owner: Node<unknown>): void
}

export interface Linker<E = void> {
  readonly level: number
  element?: E
  index: Array<Node<unknown>> // sorted children
  pending?: Array<Node<unknown>> // children in natural order
  reactiveApply(node: Node<E>): void
}

// define, applyChildren, proceed

export function define<E = void>(id: string, apply: Apply<E>, rtti?: Rtti<E>): void {
  const node: Node<any> = { id, apply, rtti: rtti || LinkerImpl.global.rtti }
  // console.log(`< defining: <${node.rtti.name}> #${node.id}...`)
  const parent = LinkerImpl.self // shorthand
  const linker = parent.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (parent !== LinkerImpl.global) {
    if (!linker.pending)
      throw new Error('children are applied already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    linker.pending.push(node)
  }
  else { // apply root immediately
    linker.pending = [node]
    applyChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function applyChildren(): void {
  // console.log(`applying children: <${self.rtti.name}> #${self.id}`)
  reconcile(LinkerImpl.self)
  // console.log(`applied children: <${self.rtti.name}> #${self.id}`)
}

export function proceed(node: Node<any>): void {
  const outer = LinkerImpl.self
  try {
    LinkerImpl.self = node
    const linker = node.linker
    if (!linker)
      throw new Error('node must be mounted before rendering')
    linker.pending = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node.apply(linker.element!)
    applyChildren() // ignored if applied already
  }
  finally {
    LinkerImpl.self = outer
  }
}

// Internal

class LinkerImpl<E> implements Linker<E> {
  level: number
  element?: E
  index: Node<unknown>[] = []
  pending?: Node<unknown>[]

  constructor(level: number) {
    this.level = level
  }

  @trigger
  reactiveApply(node: Node<E>): void {
    basicApply(node)
  }

  static global: Node<unknown> = {
    id: '<global>',
    apply: () => { /* nop */ },
    rtti: { name: '<default>', reactive: false },
    linker: new LinkerImpl<unknown>(0)
  }
  static self: Node<unknown> = LinkerImpl.global
}

function applyNodeNow(node: Node<any>): void {
  if (node.rtti.reactive)
    node.linker?.reactiveApply(node)
  else
    basicApply(node)
}

function basicApply<E>(node: Node<E>): void {
  if (node.rtti.proceed)
    node.rtti.proceed(node)
  else
    proceed(node)
}

function reconcile(self: Node<unknown>): void {
  const linker = self.linker
  const children = linker?.pending
  if (linker && children) {
    linker.pending = undefined
    const nextIndex = children.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    isolated(() => {
      // Unmount
      let i = 0, j = 0
      while (i < linker.index.length) {
        const a = linker.index[i]
        const b = nextIndex[j]
        if (!b || a.id < b.id) {
          if (a.rtti.unmount)
            a.rtti.unmount(a, self) // TODO: mitigate the risk of exception
          if (a.rtti.reactive)
            Cache.unmount(a.linker)
          a.linker = undefined
          i++
        }
        else if (a.id === b.id) {
          b.linker = a.linker
          i++, j++
        }
        else // a.id > b.id
          j++
      }
      // Mount
      let prev: Node<unknown> | undefined = undefined
      for (const x of children) {
        if (!x.linker) { // if not yet mounted
          const xLinker = new LinkerImpl<unknown>(linker.level + 1)
          Cache.of(xLinker.reactiveApply).setup({ priority: xLinker.level })
          x.linker = xLinker
          if (x.rtti.mount)
            x.rtti.mount(x, self, prev)
        }
        else if (x.rtti.ordering) // was mounted before, just re-order if needed
          x.rtti.ordering(x, self, prev)
        applyNodeNow(x)
        prev = x
      }
    })
    linker.index = nextIndex
  }
}
