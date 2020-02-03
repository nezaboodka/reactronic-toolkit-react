// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface ElementToken<E = void> {
  type?: ElementType<E>
  id: string
  element?: E
  render: Render<E>
}

export interface ElementType<E = void> {
  hint: string
  reconcile?(self: ElementToken<E>, children: Array<ElementToken<unknown>>): Array<ElementToken<unknown>>
  mount?(self: ElementToken<E>): E
  unmount?(self: ElementToken<E>): undefined
}

export class Ctx {
  outer?: unknown = undefined
  parent?: ElementToken<unknown> = undefined
  self: ElementToken<unknown> = { id: '', render: () => { /* */ } }
  children: Array<ElementToken<unknown>> = []
  done: boolean = false
}
