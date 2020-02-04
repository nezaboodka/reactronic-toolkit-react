// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Cache, cached, isolated, Stateful, trigger } from 'reactronic'

import { Context, DefaultRtti, Node, Render, Rtti } from './api.data'
export { Render } from './api.data'

export function reactive<E = void>(render: Render<E>, rtti?: Rtti<E>): void {
  const node = declareNode('', render, rtti)
  Action.run('reactive', () => new ReactiveNode<E>(node))
}

export function declareNode<E = void>(id: string, render: Render<E>, rtti?: Rtti<E>): Node<E> {
  const node: Node<any> = { rtti: rtti || DefaultRtti, id, render, children: [], done: false }
  const parent = Context.current // shorthand
  if (parent) {
    if (parent.done)
      throw new Error('children are rendered already')
    parent.children.push(node)
  }
  else // it's root element
    renderNode(node)
  return node
}

export function renderChildren(): void {
  const node = Context.current // shorthand
  if (node && !node.done) {
    node.done = true
    node.children.sort((a, b) => a.id.localeCompare(b.id)) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = node.rtti.reconcile!(node, node) // TODO: to implement
    // Unmount garbage elements
    for (const child of garbage) {
      const unmount = child.rtti.unmount
      if (unmount)
        unmount(child, node)
    }
    // Resolve and (re)render valid elements
    for (const child of node.children) {
      const mount = child.rtti.mount
      if (!child.element && mount)
        mount(child, node)
      renderNode(child)
    }
  }
}

// Internal

class Rx<E> extends Stateful {
  @cached
  render(render: Render<E>, action?: Action): void {
    // return action ? action.inspect(() => render(this.cycle)) : render(this.cycle)
  }

  @trigger
  protected pulse(): void {
    // if (Cache.of(this.render).invalid)
    //   isolated(this.refresh, {rx: this, cycle: this.cycle + 1})
  }

  // @stateless cycle: number = 0
  // @stateless refresh: (next: ReactState<V>) => void = nop
  // @stateless readonly unmount = (): (() => void) => {
  //   return (): void => { isolated(Cache.unmount, this) }
  // }

  // static create<V>(hint?: string, trace?: Trace, priority?: number): Rx<V> {
  //   const rx = new Rx<V>()
  //   if (hint)
  //     R.setTraceHint(rx, hint)
  //   if (trace) {
  //     Cache.of(rx.render).setup({trace})
  //     Cache.of(rx.pulse).setup({trace, priority})
  //   }
  //   else if (priority !== undefined)
  //     Cache.of(rx.pulse).setup({priority})
  //   return rx
  // }
}

class ReactiveNode<E> extends Stateful {
  constructor(private readonly node: Node<E>) { super() }

  @cached
  protected refresh(): void {
    const n = this.node // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return n.render(n.element!, -1)
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
