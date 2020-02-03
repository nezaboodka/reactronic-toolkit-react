// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

export function element<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  const t: ElementToken<any> = { type, id, render }
  if (curr)
    curr.children.push(t)
  else // it's root element
    renderElement(t)
}

export function renderChildren(): void {
  const c = curr // shorthand
  if (c && !c.done) {
    // TODO: Diff children
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const garbage = c.self.type?.reconcile!(c.self, c.children)
    console.log(garbage)
    for (let i = 0; i < c.children.length; i++) {
      renderElement(c.children[i])
      // acquire/mount/render
    }
    c.done = true
  }
}

export function reactive<E = void>(render: Render<E>, type?: ElementType<E>): void {
  throw new Error('not implemented')
}

export function getOuter<E>(): E {
  return curr?.outer as E
}

export type Render<E = void> = (element: E, cycle: number) => void
export type ElementChildren = Array<ElementToken<unknown>>

export interface ElementToken<E = void> {
  type?: ElementType<E>
  id: string
  element?: E
  render: Render<E>
}

export interface ElementType<E = void> {
  hint: string
  reconcile?(token: ElementToken<E>, children: ElementChildren): ElementChildren
  mount?(token: ElementToken<E>): E
  unmount?(token: ElementToken<E>): undefined
}

// Internal

class Renderer {
  outer?: unknown = undefined
  parent?: ElementToken<unknown> = undefined
  self: ElementToken<unknown> = { id: '', render: () => { /* */ } }
  children: Array<ElementToken<unknown>> = []
  done: boolean = false
}

let curr: Renderer | undefined = undefined

function renderElement(self: ElementToken<unknown>): void {
  const outer = curr
  try {
    curr = new Renderer()
    curr.self = self // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.type?.mount!(self)
    self.render(self.element, -1) // children are not yet rendered
    renderChildren() // ignored if rendered already
  }
  finally {
    curr = outer
  }
}
