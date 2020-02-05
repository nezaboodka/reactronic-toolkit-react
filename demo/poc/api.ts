// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

import { Context, DefaultNodeType, Node, NodeRefs, NodeType, Render } from './api.data'
export { Render } from './api.data'

export function reactive<E = void>(render: Render<E>, rtti?: NodeType<E>): void {
  const n = node('', render, rtti)
  Action.run('reactive', () => new Reactive<E>(render))
}

export function node<E = void>(id: string, render: Render<E>, rtti?: NodeType<E>): Node<E> {
  const n: Node<any> = { id, render, type: rtti || DefaultNodeType }
  const parent = Context.current // shorthand
  if (parent) {
    if (!parent.refs?.rendering)
      throw new Error('children are rendered already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parent.refs!.updatedChildren.push(n)
  }
  else { // it's root element
    n.refs = { element: undefined, rendering: false, sortedChildren: [], updatedChildren: [] }
    renderNode(n)
  }
  return n
}

export function renderChildren(): void {
  const self = Context.current
  const refs = self.refs
  if (self && refs && refs.rendering) {
    refs.rendering = false
    // Reconcile
    const existing = refs.sortedChildren
    const updated = refs.updatedChildren.slice()
    updated.sort((n1, n2) => n1.id.localeCompare(n2.id))
    let i = 0, j = 0
    while (i < existing.length) {
      const a = existing[i]
      const b = updated[j]
      if (a.id < b.id) {
        if (b.type.unmount)
          b.type.unmount(b, self)
        i++
      }
      else if (a.id === b.id) {
        if (a.type !== b.type || a.render !== b.render)
          b.refs = a.refs
        else
          updated[j] = a
        i++
        j++
      }
      else // a.id > b.id
        j++
    }
    // Resolve and (re)render valid elements
    for (const child of refs.updatedChildren) {
      if (!child.refs) {
        const mount = child.type.mount
        child.refs = {
          rendering: false,
          sortedChildren: [],
          updatedChildren: [],
          element: mount ? mount(child, self) : undefined
        }
      }
      renderNode(child)
    }
    refs.sortedChildren = updated
  }
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
    const refs = node.refs
    if (refs) {
      refs.rendering = true
      node.render(refs.element, -1) // children are not yet rendered
      renderChildren() // ignored if rendered already
    }
  }
  finally {
    Context.current = outer
  }
}
