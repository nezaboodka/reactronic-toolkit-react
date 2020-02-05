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
  div: { name: 'div', mount, move, unmount },
  span: { name: 'span', mount, move, unmount },
  i: { name: 'i', mount, move, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: NodeType<E>): void {
  node(id, render, type)
}

function mount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = outer.linker!.element! as HTMLElement
  const e = document.createElement(node.type.name) as E
  const a = after?.linker?.element
  if (a instanceof HTMLElement)
    parent.insertBefore(e, a.nextSibling || null)
  else
    parent.appendChild(e)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.linker!.element = e
}

function move<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = outer.linker!.element! as HTMLElement
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = node.linker?.element!
  const a = after?.linker?.element
  if (a instanceof HTMLElement && a.nextSibling !== e)
    parent.insertBefore(e, a.nextSibling || null)
}

function unmount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = node.linker!.element! // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  e.parentElement!.removeChild(e)
}
