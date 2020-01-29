// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Node, NodeType, Render } from './api'

export function div(render: Render<void, HTMLDivElement>, key?: string | number): Node<void, HTMLDivElement> {
  return html<HTMLDivElement>(tag.div, render, key)
}

export function span(render: Render<void, HTMLSpanElement>, key?: string | number): Node<void, HTMLSpanElement> {
  return html<HTMLSpanElement>(tag.span, render, key)
}

export function i(render: Render<void, HTMLSpanElement>, key?: string | number): Node<void, HTMLSpanElement> {
  return html<HTMLSpanElement>(tag.i, render, key)
}

export function t(value: string): Node<void, string> {
  return value as any
}

const tag = {
  div: { name: 'div', mount, unmount },
  span: { name: 'span', mount, unmount },
  i: { name: 'i', mount, unmount },
}

// Internal

function html<View extends HTMLElement>(type: NodeType<void, View>, render: Render<void, View>, key?: string | number): Node<any, View> {
  return { type, key, model: undefined, view: document.body as View, render }
}

function mount<View extends HTMLElement>(rx: Node<void, View>, outer: HTMLElement): void {
  rx.view = outer.appendChild(document.createElement(rx.type.name)) as View
}

function unmount<View extends HTMLElement>(rx: Node<void, View>, outer: HTMLElement): void {
  outer.removeChild(rx.view)
}