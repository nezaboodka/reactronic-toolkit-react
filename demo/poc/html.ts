// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { node } from './api'
import { Node, NodeType, Render } from './api.data'

export function div(id: string, render: Render<HTMLDivElement>): void {
  html(id, render, Html.div)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  html(id, render, Html.span)
}

export function i(id: string, render: Render<HTMLSpanElement>): void {
  html(id, render, Html.i)
}

export function t(value: string): void {
  throw new Error('not implemented')
}

const Html = {
  div: { name: 'div', mount, reconcile, unmount },
  span: { name: 'span', mount, reconcile, unmount },
  i: { name: 'i', mount, reconcile, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: NodeType<E>): void {
  node(id, render, type)
}

function mount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): E {
  const e = document.createElement(node.type.name) as E // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (outer.linker!.element! as HTMLElement).appendChild(e)
  return e
}

function reconcile<E extends HTMLElement>(node: Node<E>): Array<Node<unknown>> {
  // const e = node.element!
  // const existing: Array<Element | null> = []
  // for (let i = 0; i < e.children.length; i++)
  //   existing.push(e.children.item(i))
  // existing.sort()
  throw new Error('not implemented')
}

function unmount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (outer.linker!.element! as HTMLElement).removeChild(node.linker!.element!)
}
