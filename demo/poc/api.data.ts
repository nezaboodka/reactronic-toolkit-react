// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface Node<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly type: NodeType<E>
  linker?: NodeLinker<E>
}

export interface NodeType<E = void> {
  readonly name: string
  mount?(node: Node<E>, outer: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface NodeLinker<E = void> {
  element?: E
  reconciliation: boolean
  children: Array<Node<unknown>> // children in natural order
  index: Array<Node<unknown>> // sorted children
}

export const DefaultNodeType: NodeType<unknown> = { name: '<unknown>' }

export class Context {
  static current: Node<unknown> = {
    id: '<root>',
    render: () => { /* nop */ },
    type: DefaultNodeType,
    linker: {
      element: undefined,
      reconciliation: false,
      children: [],
      index: [],
    }
  }
}
