// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface Meta<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly type: Type<E>
}

export interface Node<E = void> {
  meta: Meta<E>
  element?: E
  children: Array<Node<unknown>>
  pending: Array<Meta<unknown>>
  sealed: boolean
}

export interface Type<E = void> {
  readonly name: string
  mount?(meta: Meta<E>, parent: Node<unknown>): E
  reconcile?(node: Node<E>, previous: Node<E>): Array<Node<unknown>>
  unmount?(element: E, meta: Meta<E>, parent: Node<unknown>): void
}

export class Context {
  static current: Node<unknown> | undefined = undefined
}

export const DefaultRtti: Type<unknown> = { name: '<unknown>' }
