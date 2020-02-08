// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Cache, isolated, Reactronic, trigger } from 'reactronic'

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
  order?(self: Node<E>, outer: Node, after?: Node): void
  unmount?(self: Node<E>, outer: Node, cause: Node): void
}

export interface Instance<E = unknown> {
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
  const t = outer.instance
  if (!t)
    throw new Error('node must be mounted before rendering')
  if (outer !== Inst.global) {
    if (!t.pending)
      throw new Error('children are applied already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    t.pending.push(self)
  }
  else { // apply root immediately
    t.pending = [self]
    applyChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function apply(self: Node<any>): void {
  const outer = Inst.current
  try {
    Inst.current = self
    const t = self.instance
    if (!t)
      throw new Error('node must be mounted before rendering')
    t.pending = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.apply(t.element!)
    applyChildren() // ignored if applied already
  }
  finally {
    Inst.current = outer
  }
}

export function applyChildren(): void {
  // console.log(`applying children: <${self.rtti.name}> #${self.id}`)
  reconcileOrdered(Inst.current)
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
    this.priority >= 0 ? this.reapply(self) : this.doApply(self)
  }

  @trigger
  reapply(self: Node<E>): void {
    this.doApply(self)
  }

  private doApply<E>(self: Node<E>): void {
    const rtti = self.rtti
    rtti.apply ? rtti.apply(self) : apply(self)
  }

  static global: Node = {
    id: '<global>',
    apply: () => { /* nop */ },
    rtti: { name: '<notype>', reactive: false },
    instance: new Inst(0)
  }
  static current: Node = Inst.global
}

function mount(self: Node, outer: Node, prev?: Node): Instance {
  // TODO: Make the code below exception-safe
  const rtti = self.rtti
  if (rtti.reactive) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const priority = outer.instance!.priority + 1
    const t = new Inst(priority)
    Cache.of(t.reapply).setup({ priority })
    if (Reactronic.isTraceOn) Reactronic.setTraceHint(t, `<${rtti.name}:${self.id}>`)
    self.instance = t
  }
  else
    self.instance = new Inst(-1) // non-reactive
  if (rtti.mount)
    rtti.mount(self, outer, prev)
  return self.instance
}

function unmount(self: Node, outer: Node, cause: Node): void {
  // TODO: Make the code below exception-safe
  const rtti = self.rtti
  if (rtti.unmount)
    rtti.unmount(self, outer, cause)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const inst = self.instance!
  if (rtti.reactive)
    Cache.unmount(inst)
  for (const t of inst.children)
    unmount(t, self, cause)
  self.instance = undefined
}

function reconcileOrdered(self: Node): void {
  const t = self.instance
  if (t && t.pending) {
    const pending = t.pending
    t.pending = undefined
    const children = pending.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    isolated(() => {
      let i = 0, j = 0
      while (i < t.children.length) {
        const old = t.children[i]
        const fresh = children[j]
        if (!fresh || old.id < fresh.id)
          unmount(old, self, old), i++
        else if (old.id === fresh.id)
          fresh.instance = old.instance, i++, j++
        else
          j++ // will mount/order below
      }
      let prevSibling: Node | undefined = undefined
      for (const x of pending) {
        if (!x.instance)
          mount(x, self, prevSibling).apply(x)
        else if (x.rtti.order)
          x.rtti.order(x, self, prevSibling)
        prevSibling = x
      }
    })
    t.children = children
  }
}

function reconcileUnordered(self: Node): void {
  const t = self.instance
  if (t && t.pending) {
    const children = t.pending.sort((n1, n2) => n1.id.localeCompare(n2.id))
    t.pending = undefined
    isolated(() => {
      let i = 0, j = 0
      while (i < t.children.length || j < children.length) {
        const old = t.children[i]
        const fresh = children[j]
        if (!old || old.id > fresh.id)
          mount(fresh, self).apply(fresh), j++
        else if (!fresh || old.id < fresh.id)
          unmount(old, self, old), i++
        else if (old.id === fresh.id)
          fresh.instance = old.instance, i++, j++
        else
          console.log('ugh - logic is broken')
      }
    })
    t.children = children
  }
}
