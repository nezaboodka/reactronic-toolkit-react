// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Key, Node, reactive, Render, Rtti } from './api'

export function div(render: Render<HTMLDivElement>, k?: Key): void {
  reactiveHtmlNode<HTMLDivElement>(k, HtmlRtti.div, render)
}

export function span(render: Render<HTMLSpanElement>, k?: Key): void {
  reactiveHtmlNode<HTMLSpanElement>(k, HtmlRtti.span, render)
}

export function i(render: Render<HTMLSpanElement>, k?: Key): void {
  reactiveHtmlNode<HTMLSpanElement>(k, HtmlRtti.i, render)
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

function reactiveHtmlNode<T extends HTMLElement>(k: Key,
  rtti: Rtti<T>, render: Render<T>, ): void {
  reactive(k, render, rtti)
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
