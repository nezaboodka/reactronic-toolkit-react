// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface Node<E = void> {
  rtti?: Rtti<E>
  id: string
  element?: E
  render: Render<E>
  children: Array<Node<unknown>>
  done: boolean
}

export interface Rtti<E = void> {
  hint: string
  mount?(node: Node<E>, parent: Node<unknown>): E
  reconcile?(node: Node<E>, children: Array<Node<unknown>>): Array<Node<unknown>>
  unmount?(node: Node<E>, parent: Node<unknown>): undefined
}

export class Context {
  static current: Node<unknown> | undefined = undefined
}
