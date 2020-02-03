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
  mount?(self: ElementToken<E>, parent: ElementToken<unknown>): E
  reconcile?(self: ElementToken<E>, children: Array<ElementToken<unknown>>): Array<ElementToken<unknown>>
  unmount?(self: ElementToken<E>, parent: ElementToken<unknown>): undefined
}

export class Context {
  static current: Context | undefined = undefined
  outer?: unknown = undefined
  parent?: ElementToken<unknown> = undefined
  self: ElementToken<unknown> = { id: '', render: () => { /* */ } }
  children: Array<ElementToken<unknown>> = []
  done: boolean = false
  constructor(self: ElementToken<unknown>) { this.self = self }
}
