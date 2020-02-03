// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Context, ElementToken, ElementType, Render } from './api.data'
export { Render } from './api.data'

export function element<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  const et: ElementToken<any> = { type, id, render }
  const ctx = Context.current // shorthand
  if (ctx) {
    if (ctx.done)
      throw new Error('element children are rendered already')
    ctx.children.push(et)
  }
  else // it's root element
    renderElement(et)
}

export function reactive<E = void>(render: Render<E>, type?: ElementType<E>): void {
  throw new Error('not implemented')
}

export function renderChildren(): void {
  const ctx = Context.current // shorthand
  if (ctx && !ctx.done) {
    ctx.done = true // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = ctx.self.type?.reconcile!(ctx.self, ctx.children)
    // Unmount garbage elements
    for (const child of garbage) {
      const unmount = child.type?.unmount
      if (unmount)
        unmount(child, ctx.self)
    }
    // Resolve and (re)render valid elements
    for (const child of ctx.children) {
      const mount = child.type?.mount
      if (!child.element && mount)
        mount(child, ctx.self)
      renderElement(child)
    }
  }
}

// Internal

function renderElement(self: ElementToken<unknown>): void {
  const outer = Context.current
  try {
    Context.current = new Context(self)
    self.render(self.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    Context.current = outer
  }
}
