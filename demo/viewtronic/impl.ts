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
  instance?: Instance<E>
}

export interface Rtti<E = unknown> {
  readonly name: string
  readonly reactive: boolean
  apply?(self: Node<E>): void
  mount?(self: Node<E>, outer: Node, after?: Node): void
  ordering?(self: Node<E>, outer: Node, after?: Node): void
  unmount?(self: Node<E>, outer: Node, cause: Node): void
}

export interface Instance<E = void> {
  readonly priority: number
  element?: E
  children: Array<Node>
  pending?: Array<Node> // in natural order
  apply(self: Node<E>): void
}

// fragment, apply applyChildren

export function fragment<E = unknown>(id: string, apply: Apply<E>, rtti?: Rtti<E>): void {
  const self: Node<any> = { id, apply, rtti: rtti || Inst.global.rtti }
  // console.log(`< defining: <${node.rtti.name}> #${node.id}...`)
  const outer = Inst.current // shorthand
  const x = outer.instance
  if (!x)
    throw new Error('node must be mounted before rendering')
  if (outer !== Inst.global) {
    if (!x.pending)
      throw new Error('children are applied already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    x.pending.push(self)
  }
  else { // apply root immediately
    x.pending = [self]
    applyChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function apply(self: Node<any>): void {
  const outer = Inst.current
  try {
    Inst.current = self
    const x = self.instance
    if (!x)
      throw new Error('node must be mounted before rendering')
    x.pending = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.apply(x.element!)
    applyChildren() // ignored if applied already
  }
  finally {
    Inst.current = outer
  }
}

export function applyChildren(): void {
  // console.log(`applying children: <${self.rtti.name}> #${self.id}`)
  reconcile(Inst.current)
  // console.log(`applied children: <${self.rtti.name}> #${self.id}`)
}

// Internal

class Inst<E = unknown> implements Instance<E> {
  readonly priority: number
  element?: E
  children: Node[] // TODO: nullable
  pending?: Node[]

  constructor(priority: number) {
    this.priority = priority
    this.children = []
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

  basicApply<E>(self: Node<E>): void {
    if (self.rtti.apply)
      self.rtti.apply(self)
    else
      apply(self)
  }

  static global: Node = {
    id: '<global>',
    apply: () => { /* nop */ },
    rtti: { name: '<default>', reactive: false },
    instance: new Inst(0)
  }
  static current: Node = Inst.global
}

function reconcile(self: Node): void {
  const x = self.instance
  const pending = x?.pending
  if (x && pending) {
    x.pending = undefined
    const children = pending.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    isolated(() => {
      let i = 0, j = 0
      while (i < x.children.length) {
        const a = x.children[i]
        const b = children[j]
        if (!b || a.id < b.id) { // then unmount
          unmount(a, self, a)
          i++
        }
        else if (a.id === b.id) { // then preserve
          b.instance = a.instance
          i++, j++
        }
        else // will mount
          j++
      }
      let prev: Node | undefined = undefined
      for (const b of pending) {
        if (!b.instance)
          mount(b, self, prev)
        else if (b.rtti.ordering) // then re-order if needed
          b.rtti.ordering(b, self, prev)
        // Apply
        // eslint-disable-next-line prefer-spread
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        b.instance!.apply(b)
        prev = b
      }
    })
    x.children = children
  }
}

function mount(self: Node, outer: Node, prev?: Node): void {
  const rtti = self.rtti
  if (rtti.reactive) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const priority = outer.instance!.priority + 1
    const x = new Inst(priority)
    Cache.of(x.reactiveApply).setup({ priority })
    self.instance = x
  }
  else
    self.instance = new Inst(-1)
  if (rtti.mount)
    rtti.mount(self, outer, prev)
}

function unmount(self: Node, outer: Node, cause: Node): void {
  const rtti = self.rtti
  if (rtti.unmount)
    rtti.unmount(self, outer, cause) // TODO: mitigate the risk of exception
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const inst = self.instance!
  if (rtti.reactive)
    Cache.unmount(inst)
  for (const t of inst.children)
    unmount(t, self, cause)
  self.instance = undefined
}
