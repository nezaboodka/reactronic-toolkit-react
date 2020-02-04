// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Context, Node, Render, Rtti } from './api.data'
export { Render } from './api.data'

export function declare<E = void>(id: string, render: Render<E>, rtti?: Rtti<E>): void {
  const node: Node<any> = { rtti, id, render, children: [], done: false }
  const parent = Context.current // shorthand
  if (parent) {
    if (parent.done)
      throw new Error('element children are rendered already')
    parent.children.push(node)
  }
  else // it's root element
    renderNode(node)
}

export function reactive<E = void>(render: Render<E>, type?: Rtti<E>): void {
  throw new Error('not implemented')
}

export function renderChildren(): void {
  const node = Context.current // shorthand
  if (node && !node.done) {
    node.done = true // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = node.rtti?.reconcile!(node, node.children)
    // Unmount garbage elements
    for (const child of garbage) {
      const unmount = child.rtti?.unmount
      if (unmount)
        unmount(child, node)
    }
    // Resolve and (re)render valid elements
    for (const child of node.children) {
      const mount = child.rtti?.mount
      if (!child.element && mount)
        mount(child, node)
      renderNode(child)
    }
  }
}

// Internal

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
