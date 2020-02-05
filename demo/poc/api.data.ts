// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export type Render<E = void> = (element: E, cycle: number) => void

export interface Node<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly type: NodeType<E>
  linker?: Linker<E>
}

export interface NodeType<E = void> {
  readonly name: string
  render?(node: Node<E>, cycle: number): void
  mount?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  move?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface Linker<E = void> {
  element?: E
  reconciliation: boolean
  children: Array<Node<unknown>> // children in natural order
  index: Array<Node<unknown>> // sorted children
}

export const DefaultRender: Render<unknown> = () => { /* nop */ }
export const DefaultNodeType: NodeType<unknown> = { name: '<unknown>' }

export class Context {
  static self: Node<unknown> = {
    id: '<root>',
    render: DefaultRender,
    type: DefaultNodeType,
    linker: { reconciliation: false, children: [], index: [] }
  }
}
