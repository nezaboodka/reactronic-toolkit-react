// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { define, Node, Render } from './api'

// Tags

export function div(id: string, render: Render<HTMLDivElement>): void {
  define(id, render, Html.div)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, Html.span)
}

export function i(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, Html.i)
}

export function text(value: string): void {
  throw new Error('not implemented')
}

// Internal

let currentHtmlElement: HTMLElement | undefined = undefined

function render<E extends HTMLElement>(node: Node<E>, cycle: number): void {
  const outer = currentHtmlElement
  try { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const self = node.linker!.element!
    currentHtmlElement = self
    node.render(self, cycle)
  }
  finally {
    currentHtmlElement = outer
  }
}

function mount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  const parent = currentHtmlElement || document.body
  const prev = after?.linker?.element
  const e = document.createElement(node.type.name) as E
  if (prev instanceof HTMLElement)
    parent.insertBefore(e, prev.nextSibling)
  else
    parent.appendChild(e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.linker!.element = e
}

function move<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  const parent = currentHtmlElement || document.body
  const prev = after?.linker?.element
  const e = node.linker?.element
  if (e && prev instanceof HTMLElement && prev.nextSibling !== e)
    parent.insertBefore(e, prev.nextSibling)
}

function unmount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): void {
  const e = node.linker?.element
  if (e && e.parentElement)
    e.parentElement.removeChild(e)
}

const Html = {
  div: { name: 'div', render, mount, move, unmount },
  span: { name: 'span', render, mount, move, unmount },
  i: { name: 'i', render, mount, move, unmount },
}
