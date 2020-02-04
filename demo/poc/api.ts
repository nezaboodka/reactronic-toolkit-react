// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

import { Context, DefaultRtti, Meta, Node, Render, Type } from './api.data'
export { Render } from './api.data'

export function reactive<E = void>(render: Render<E>, rtti?: Type<E>): void {
  const node = declaration('', render, rtti)
  Action.run('reactive', () => new Reactive<E>(render))
}

export function declaration<E = void>(id: string, render: Render<E>, rtti?: Type<E>): Meta<E> {
  const meta: Meta<any> = { id, render, type: rtti || DefaultRtti }
  const parent = Context.current // shorthand
  if (parent) {
    if (parent.sealed)
      throw new Error('children are rendered already')
    parent.pending.push(meta)
  }
  else // it's root element
    renderNode({ meta, children: [], pending: [], sealed: false })
  return meta
}

export function renderChildren(): void {
  const self = Context.current // shorthand
  if (self && !self.sealed) {
    self.sealed = true
    self.pending.sort((a, b) => a.id.localeCompare(b.id))
    const prev = self // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = self.meta.type.reconcile!(self, prev) // TODO: to implement
    // Unmount garbage elements
    for (const child of garbage) {
      const unmount = child.meta.type.unmount
      if (unmount)
        unmount(child.element, child.meta, self)
    }
    // Resolve and (re)render valid elements
    for (const child of self.children) {
      const mount = child.meta.type.mount
      if (!child.element && mount)
        child.element = mount(child.meta, self)
      renderNode(child)
    }
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
    node.meta.render(node.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    Context.current = outer
  }
}
