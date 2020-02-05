// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { define, Node, Render, renderChildren, renderNode } from './api'

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

// Internal

class HtmlContext {
  static root: HTMLElement = document.body
  static self = HtmlContext.root
}

function embrace<E extends HTMLElement>(node: Node<E>): void {
  console.log(`enter: <${node.type.name}> #${node.id}...`)
  const outer = HtmlContext.self
  try { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const self = node.linker!.element!
    HtmlContext.self = self
    renderNode(node)
  }
  finally {
    HtmlContext.self = outer
  }
  console.log(`leave: <${node.type.name}> #${node.id}`)
}

function mount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  const parent = HtmlContext.self
  const prev = after?.linker?.element
  const e = document.createElement(node.type.name) as E
  e.id = node.id
  if (prev instanceof HTMLElement)
    parent.insertBefore(e, prev.nextSibling)
  else
    parent.appendChild(e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.linker!.element = e
  console.log(`  mounted: <${node.type.name}> #${node.id}`)
}

function move<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  const parent = HtmlContext.self
  const prev = after?.linker?.element
  const e = node.linker?.element
  if (e && prev instanceof HTMLElement && prev.nextSibling !== e)
    parent.insertBefore(e, prev.nextSibling)
  console.log(`  moved: <${node.type.name}> #${node.id}`)
}

function unmount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): void {
  const e = node.linker?.element
  if (e && e.parentElement)
    e.parentElement.removeChild(e)
  console.log(`  unmounted: <${node.type.name}> #${node.id}`)
}

const Html = {
  div: { name: 'div', embrace, mount, move, unmount },
  span: { name: 'span', embrace, mount, move, unmount },
  i: { name: 'i', embrace, mount, move, unmount },
}

