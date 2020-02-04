// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

import { Context, DefaultRtti, Node, Render, Rtti } from './api.data'
export { Render } from './api.data'

export function reactive<E = void>(render: Render<E>, rtti?: Rtti<E>): void {
  const node = declareNode('', render, rtti)
  Action.run('reactive', () => new Reactive<E>(node))
}

export function declareNode<E = void>(id: string, render: Render<E>, rtti?: Rtti<E>): Node<E> {
  const node: Node<any> = { rtti: rtti || DefaultRtti, id, render, children: [], sealed: false }
  const parent = Context.current // shorthand
  if (parent) {
    if (parent.sealed)
      throw new Error('children are rendered already')
    parent.children.push(node)
  }
  else // it's root element
    renderNode(node)
  return node
}

export function renderChildren(): void {
  const node = Context.current // shorthand
  if (node && !node.sealed) {
    node.sealed = true
    node.children.sort((a, b) => a.id.localeCompare(b.id))
    const prev = node // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = node.rtti.reconcile!(node, prev) // TODO: to implement
    // Unmount garbage elements
    for (const child of garbage)
      if (child.rtti.unmount)
        child.rtti.unmount(child, node)
    // Resolve and (re)render valid elements
    for (const child of node.children) {
      if (!child.element && child.rtti.mount)
        child.rtti.mount(child, node)
      renderNode(child)
    }
  }
}

// Internal

class Reactive<E> extends Stateful {
  constructor(private readonly node: Node<E>) { super() }

  @trigger
  protected pulse(): void {
    if (Cache.of(this.refresh).invalid)
      isolated(this.refresh)
  }

  @cached
  protected refresh(): void {
    renderNode(this.node as Node<unknown>)
  }
}

function renderNode(node: Node<unknown>): void {
  const outer = Context.current
  try {
    Context.current = node
    node.render(node.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    Context.current = outer
  }
}
