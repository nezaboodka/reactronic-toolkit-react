// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Ctx, ElementToken, ElementType, Render } from './api.data'
export { Render } from './api.data'

export function element<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  const et: ElementToken<any> = { type, id, render }
  const ctx = context // shorthand
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
  const ctx = context // shorthand
  if (ctx && !ctx.done) { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = ctx.self.type?.reconcile!(ctx.self, ctx.children)
    // Unmount garbage elements
    for (const x of garbage) {
      const unmount = x.type?.unmount
      if (unmount)
        unmount(x)
    }
    // Resolve and (re)render valid elements
    for (let i = 0; i < ctx.children.length; i++) {
      const et = ctx.children[i]
      const mount = et.type?.mount
      if (!et.element && mount)
        mount(et)
      renderElement(et)
    }
    ctx.done = true
  }
}

export function getOuter<E>(): E {
  return context?.outer as E
}

// Internal

let context: Ctx | undefined = undefined

function renderElement(self: ElementToken<unknown>): void {
  const outer = context
  try {
    context = new Ctx()
    context.self = self // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.type?.mount!(self)
    self.render(self.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    context = outer
  }
}
