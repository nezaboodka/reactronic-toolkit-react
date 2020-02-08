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
  readonly priority: number
  element?: E
  sortedChildren: Array<Node>
  pendingChildren?: Array<Node> // in natural order
  apply(self: Node<E>): void
}

// fragment, apply applyChildren

export function fragment<E = unknown>(id: string, apply: Apply<E>, rtti?: Rtti<E>): void {
  const self: Node<any> = { id, apply, rtti: rtti || LinkerImpl.global.rtti }
  // console.log(`< defining: <${node.rtti.name}> #${node.id}...`)
  const outer = LinkerImpl.current // shorthand
  const linker = outer.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (outer !== LinkerImpl.global) {
    if (!linker.pendingChildren)
      throw new Error('children are applied already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    linker.pendingChildren.push(self)
  }
  else { // apply root immediately
    linker.pendingChildren = [self]
    applyChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function apply(self: Node<any>): void {
  const outer = LinkerImpl.current
  try {
    LinkerImpl.current = self
    const linker = self.linker
    if (!linker)
      throw new Error('node must be mounted before rendering')
    linker.pendingChildren = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.apply(linker.element!)
    applyChildren() // ignored if applied already
  }
  finally {
    LinkerImpl.current = outer
  }
}

export function applyChildren(): void {
  // console.log(`applying children: <${self.rtti.name}> #${self.id}`)
  reconcile(LinkerImpl.current)
  // console.log(`applied children: <${self.rtti.name}> #${self.id}`)
}

// Internal

class LinkerImpl<E = unknown> implements Linker<E> {
  priority: number
  element?: E
  sortedChildren: Node[] = []
  pendingChildren?: Node[]

  constructor(priority: number) {
    this.priority = priority
  }

  apply(self: Node<E>): void {
    if (this.priority >= 0)
      this.reactiveApply(self)
    else
      this.basicApply(self)
  }

  @trigger
  reactiveApply(self: Node<E>): void {
    this.basicApply(self)
  }

  private basicApply<E>(self: Node<E>): void {
    if (self.rtti.apply)
      self.rtti.apply(self)
    else
      apply(self)
  }

  static global: Node = {
    id: '<global>',
    apply: () => { /* nop */ },
    rtti: { name: '<default>', reactive: false },
    linker: new LinkerImpl(0)
  }
  static current: Node = LinkerImpl.global
}

function reconcile(self: Node): void {
  const linker = self.linker
  const pending = linker?.pendingChildren
  if (linker && pending) {
    linker.pendingChildren = undefined
    const sorted = pending.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    isolated(() => {
      let i = 0, j = 0
      while (i < linker.sortedChildren.length) {
        const a = linker.sortedChildren[i]
        const b = sorted[j]
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
      for (const x of pending) {
        if (!x.linker) { // then mount
          if (x.rtti.reactive) {
            const xl = new LinkerImpl(linker.priority + 1)
            Cache.of(xl.reactiveApply).setup({ priority: xl.priority })
            x.linker = xl
          }
          else
            x.linker = new LinkerImpl(-1)
          if (x.rtti.mount)
            x.rtti.mount(x, self, prev)
        }
        else if (x.rtti.ordering) // then re-order if needed
          x.rtti.ordering(x, self, prev)
        // Apply
        // eslint-disable-next-line prefer-spread
        x.linker.apply(x)
        prev = x
      }
    })
    linker.sortedChildren = sorted
  }
}
