// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { declare } from './api'
import { Node, Render, Rtti } from './api.data'

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
  div: { hint: 'div', mount, reconcile, unmount },
  span: { hint: 'span', mount, reconcile, unmount },
  i: { hint: 'i', mount, reconcile, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: Rtti<E>): void {
  declare(id, render, type)
}

function mount<E extends HTMLElement>(node: Node<E>, parent: Node<unknown>): E {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = document.createElement(node.rtti!.hint) as E
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (parent.element! as HTMLElement).appendChild(e)
  node.element = e
  return e
}

function reconcile<E extends HTMLElement>(node: Node<E>,
  children: Array<Node<unknown>>): Array<Node<unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = node.element!
  const existing: Array<Element | null> = []
  for (let i = 0; i < e.children.length; i++)
    existing.push(e.children.item(i))
  existing.sort()
  throw new Error('not implemented')
}

function unmount<E extends HTMLElement>(node: Node<E>, parent: Node<unknown>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (parent.element! as HTMLElement).removeChild(node.element!)
  return undefined
}
