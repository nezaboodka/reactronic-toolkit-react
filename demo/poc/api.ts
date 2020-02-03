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
    apply(t)
}

export function done(): void {
  const c = curr // shorthand
  if (c) {
    // TODO: Diff children
    for (let i = c.flushed; i < c.children.length; i++) {
      apply(c.children[i])
      // acquire/mount/render
    }
    c.flushed = c.children.length
  }
}

export function reactive<E = void>(render: Render<E>, type?: ElementType<E>): void {
  throw new Error('not implemented')
}

export function getOuter<E>(): E {
  return curr?.outer as E
}

export type Render<E = void> = (element: E, cycle: number) => void

export interface ElementToken<E = void> {
  type?: ElementType<E>
  id: string
  element?: E
  render: Render<E>
}

export interface ElementType<E = void> {
  hint: string
  resolve?(children: Array<ElementToken<E>>, start: number, count: number): void
  mount?(token: ElementToken<E>): E
  unmount?(token: ElementToken<E>): undefined
}

// Internal

class Renderer {
  outer?: unknown = undefined
  parent?: ElementToken<unknown> = undefined
  self: ElementToken<unknown> = { id: '', render: () => { /* */ } }
  children: Array<ElementToken<unknown>> = []
  flushed: number = 0
}

let curr: Renderer | undefined = undefined

function apply(et: ElementToken<unknown>): void {
  const outer = curr
  try {
    curr = new Renderer()
    curr.self = et // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    et.type?.mount!(et)
    et.render(et.element, -1) // children are not yet rendered
    done()
  }
  finally {
    curr = outer
  }
}
