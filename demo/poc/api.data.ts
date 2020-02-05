// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface Node<E = void> {
  readonly id: string
  render: Render<E>
  type: NodeType<E>
  refs?: NodeRefs<E>
}

export interface NodeType<E = void> {
  readonly name: string
  mount?(node: Node<E>, outer: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface NodeRefs<E = void> {
  element?: E
  rendering: boolean
  sortedChildren: Array<Node<unknown>> // sorted order
  updatedChildren: Array<Node<unknown>> // natural order
}

export const DefaultNodeType: NodeType<unknown> = { name: '<unknown>' }

export class Context {
  static current: Node<unknown> = {
    id: '<root>',
    render: () => { /* nop */ },
    type: DefaultNodeType,
    refs: {
      element: undefined,
      rendering: false,
      sortedChildren: [],
      updatedChildren: [],
    }
  }
}
