// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

// Render, Node, Type, Linker

export type Render<E = void> = (element: E, cycle: number) => void

export interface Node<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly type: Type<E>
  linker?: Linker<E>
}

export interface Type<E = void> {
  readonly name: string
  embrace?(node: Node<E>, cycle: number): void
  mount?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  move?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface Linker<E = void> {
  element?: E
  reconciliation: boolean
  children: Array<Node<unknown>> // children in natural order
  index: Array<Node<unknown>> // sorted children
}

// reactive, define, renderChildren

export function reactive<E = void>(id: string, render: Render<E>, rtti: Type<E>): void {
  const n = define(id, render, rtti)
  // Action.run('reactive', () => new Reactive<E>(render))
}

export function define<E = void>(id: string, render: Render<E>, rtti: Type<E>): void {
  console.log(`< defining: <${rtti.name}> #${id}...`)
  const n: Node<any> = { id, render, type: rtti || DefaultNodeType }
  const parent = Context.self // shorthand
  const linker = parent.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (!linker.reconciliation && parent !== Context.root)
    throw new Error('children are rendered already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  linker.children.push(n)
  console.log(`/> defined: <${rtti.name}> #${id}`)
  if (parent === Context.root) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent.linker!.reconciliation = true
    renderChildren()
  }
}

export function renderNode<E>(node: Node<E>): void {
  const linker = node.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  linker.reconciliation = true // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.render(linker.element!, -1)
  renderChildren() // ignored if rendered already
}

export function renderChildren(): void {
  const self = Context.self
  console.log(`rendering children: <${self.type.name}> #${self.id}`)
  const linker = self.linker
  if (linker && reconcile(linker, self)) {
    let prev: Node<unknown> | undefined = undefined
    for (const child of linker.children) {
      if (!child.linker) {
        child.linker = { reconciliation: false, children: [], index: [] }
        if (child.type.mount)
          child.type.mount(child, self, prev)
      }
      else if (child.type.move)
        child.type.move(child, self, prev)
      embrace(child)
      prev = child
    }
  }
  console.log(`rendered children: <${self.type.name}> #${self.id}`)
}

// Internal: Context

export const DefaultRender: Render<unknown> = () => { /* nop */ }
export const DefaultNodeType: Type<unknown> = { name: '<unknown>' }

class Context {
  static root: Node<unknown> = {
    id: '<root>',
    render: DefaultRender,
    type: DefaultNodeType,
    linker: { reconciliation: false, children: [], index: [] }
  }
  static self = Context.root
}

function embrace(node: Node<unknown>): void {
  const outer = Context.self
  try {
    Context.self = node
    if (node.type.embrace)
      node.type.embrace(node, -1)
    else
      renderNode(node)
  }
  finally {
    Context.self = outer
  }
}

function reconcile(linker: Linker<unknown>, self: Node<unknown>): boolean {
  let result = false
  if (linker.reconciliation) {
    console.log(`  reconciling: <${self.type.name}> #${self.id}...`)
    result = true
    linker.reconciliation = false
    const reindexed = linker.children.slice()
    reindexed.sort((n1, n2) => n1.id.localeCompare(n2.id))
    let i = 0, j = 0
    while (i < linker.index.length) {
      const a = linker.index[i]
      const b = reindexed[j]
      if (a.id < b.id) {
        if (b.type.unmount)
          b.type.unmount(b, self)
        b.linker = undefined
        i++
      }
      else if (a.id === b.id) {
        if (a.type === b.type && a.render !== b.render)
          reindexed[j] = a // reuse existing instance in whole
        else
          b.linker = a.linker // reuse existing linker only
        i++
        j++
      }
      else // a.id > b.id
        j++
    }
    linker.index = reindexed
    console.log(`  reconciled: <${self.type.name}> #${self.id}`)
  }
  return result
}

// Internal: Reactive

class Reactive<E> extends Stateful {
  constructor(private readonly render: Render<E>) { super() }

  @trigger
  protected pulse(): void {
    if (Cache.of(this.refresh).invalid)
      isolated(this.refresh)
  }

  @cached
  protected refresh(): void {
    // renderNode(this.node as Node<unknown>)
  }
}
