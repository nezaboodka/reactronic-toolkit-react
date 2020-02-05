// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

import { Context, DefaultNodeType, Linker, Node, NodeType, Render } from './api.data'
export { Render } from './api.data'

export function reactive<E = void>(id: string, render: Render<E>, rtti?: NodeType<E>): void {
  const n = node(id, render, rtti)
  Action.run('reactive', () => new Reactive<E>(render))
}

export function node<E = void>(id: string, render: Render<E>, rtti?: NodeType<E>): Node<E> {
  const n: Node<any> = { id, render, type: rtti || DefaultNodeType }
  const parent = Context.current // shorthand
  if (parent) {
    if (!parent.linker?.reconciliation)
      throw new Error('children are rendered already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent.linker!.children.push(n)
  }
  else { // it's root element
    n.linker = { element: undefined, reconciliation: false, children: [], index: [] }
    renderNode(n)
  }
  return n
}

export function renderChildren(): void {
  const self = Context.current
  const linker = self.linker
  if (linker && reconcile(linker, self)) {
    for (const child of linker.children) {
      if (!child.linker) {
        child.linker = { reconciliation: false, children: [], index: [] }
        if (child.type.mount)
          child.type.mount(child, self)
      }
      renderNode(child)
    }
  }
}

function reconcile(linker: Linker<unknown>, self: Node<unknown>): boolean {
  let result = false
  if (linker.reconciliation) {
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
  }
  return result
}

// Internal

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

function renderNode(node: Node<unknown>): void {
  const outer = Context.current
  try {
    Context.current = node
    const linker = node.linker
    if (linker) {
      linker.reconciliation = true
      node.render(linker.element, -1) // children are not yet rendered
      renderChildren() // ignored if rendered already
    }
  }
  finally {
    Context.current = outer
  }
}
