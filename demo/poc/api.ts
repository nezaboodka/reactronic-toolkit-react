// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

export function element<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  const t: ElementToken<any> = { type, id, render }
  if (curr)
    curr.children.push(t)
  else
    apply(t)
}

export function flush(): void {
  const c = curr // shorthand
  if (c) {
    for (let i = c.flushed; i < c.children.length; i++) {
      // acquire/mount/render
    }
    c.flushed = c.children.length
  }
}

export function reactive<E = void>(id: string, render: Render<E>, type?: ElementType<E>): void {
  throw new Error('not implemented')
}

export type Render<E = void> = (element: E, cycle: number) => void

export interface ElementToken<E = void> {
  type?: ElementType<E>
  id?: string
  mounted?: E
  render: Render<E>
}

export interface ElementType<E = void> {
  hint: string
  acquire?(token: ElementToken<E>): void
  mount?(token: ElementToken<E>): E
  unmount?(token: ElementToken<E>): undefined
}

// Internal

class Renderer {
  outer?: unknown = undefined
  parent?: ElementToken<unknown> = undefined
  self: ElementToken<unknown> = { render: () => { /* */ }}
  children: Array<ElementToken<unknown>> = []
  flushed: number = 0
}

let curr: Renderer | undefined = undefined

function apply(t: ElementToken<unknown>): void {
  const outer = curr
  try {
    curr = new Renderer()
    curr.self = t // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    t.type?.mount!(t)
    t.render(t.mounted, -1) // children are not yet rendered
    // TODO: Diff children
    // TODO: Render children
  }
  finally {
    curr = outer
  }
}
