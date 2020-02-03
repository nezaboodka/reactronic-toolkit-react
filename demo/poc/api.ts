// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Ctx, ElementToken, ElementType, Render } from './api.data'
export { Render } from './api.data'

export function element<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  const t: ElementToken<any> = { type, id, render }
  if (ctx)
    ctx.children.push(t)
  else // it's root element
    renderElement(t)
}

export function reactive<E = void>(render: Render<E>, type?: ElementType<E>): void {
  throw new Error('not implemented')
}

export function renderChildren(): void {
  const c = ctx // shorthand
  if (c && !c.done) {
    // TODO: Diff children
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = c.self.type?.diff!(c.self, c.children)
    for (let i = 0; i < c.children.length; i++) {
      renderElement(c.children[i])
      // acquire/mount/render
    }
    c.done = true
    console.log(garbage) // TODO: remove garbage
  }
}

export function getOuter<E>(): E {
  return ctx?.outer as E
}

// Internal

let ctx: Ctx | undefined = undefined

function renderElement(self: ElementToken<unknown>): void {
  const outer = ctx
  try {
    ctx = new Ctx()
    ctx.self = self // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.type?.mount!(self)
    self.render(self.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    ctx = outer
  }
}
