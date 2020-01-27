// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Children, Node, NodeType } from './api'

export interface DivModel {
  className?: string
  style?: any
  innerHTML?: string
}

export function div(m: DivModel | string, children?: Children): Node<DivModel | string, HTMLDivElement> {
  return html<HTMLDivElement>(tag.div, m, children)
}

export function span(m: DivModel | string, children?: Children): Node<DivModel | string, HTMLSpanElement> {
  return html<HTMLSpanElement>(tag.span, m, children)
}

export function i(m: DivModel | string, children?: Children): Node<DivModel | string, HTMLSpanElement> {
  return html<HTMLSpanElement>(tag.i, m, children)
}

const tag = {
  div: { name: 'div', update, mount, unmount },
  span: { name: 'span', update, mount, unmount },
  i: { name: 'i', update, mount, unmount },
}

// Internal

function html<View extends HTMLElement>(type: NodeType<unknown, View>, model: unknown, children?: Children): Node<any, View> {
  return { type, key: undefined, model, view: document.body as View, children }
}

function update(m: unknown, v: HTMLElement): void {
  // v.className = m.className || ''
  // v.innerHTML = m.innerHTML || ''
}

function mount<View extends HTMLElement>(rx: Node<unknown, View>, outer: HTMLElement): void {
  rx.view = outer.appendChild(document.createElement(rx.type.name)) as View
}

function unmount<View extends HTMLElement>(rx: Node<unknown, View>, outer: HTMLElement): void {
  outer.removeChild(rx.view)
}
