// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Key, Node, reactive, Render, Rtti } from './api'

export function div(render: Render<HTMLDivElement>, k?: Key): void {
  reactiveHtml<HTMLDivElement>(render, k, HtmlRtti.div)
}

export function span(render: Render<HTMLSpanElement>, k?: Key): void {
  reactiveHtml<HTMLSpanElement>(render, k, HtmlRtti.span)
}

export function i(render: Render<HTMLSpanElement>, k?: Key): void {
  reactiveHtml<HTMLSpanElement>(render, k, HtmlRtti.i)
}

export function t(value: string): void {
  throw new Error('not implemented')
}

const HtmlRtti = {
  div: { name: 'div', renderHtmlNode, mount, unmount },
  span: { name: 'span', renderHtmlNode, mount, unmount },
  i: { name: 'i', renderHtmlNode, mount, unmount },
}

// Internal

const outer = document.body

function reactiveHtml<T extends HTMLElement>(render: Render<T>,
  k: Key, rtti: Rtti<T>, ): void {
  reactive(render, k, rtti)
}

function renderHtmlNode<T extends HTMLElement>(node: Node<T>): void {
  //
}

function mount<T extends HTMLElement>(node: Node<T>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.element = outer.appendChild(document.createElement(node.rtti!.name)) as T
}

function unmount<T extends HTMLElement>(node: Node<T>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  outer.removeChild(node.element!)
}
