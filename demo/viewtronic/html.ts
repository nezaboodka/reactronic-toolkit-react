// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { define, Node, Render, Type } from './api'

export function div(id: string, render: Render<HTMLDivElement>): void {
  defineHtmlTag(id, render, Html.div)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  defineHtmlTag(id, render, Html.span)
}

export function i(id: string, render: Render<HTMLSpanElement>): void {
  defineHtmlTag(id, render, Html.i)
}

export function text(value: string): void {
  throw new Error('not implemented')
}

const Html = {
  div: { name: 'div', render, mount, move, unmount },
  span: { name: 'span', render, mount, move, unmount },
  i: { name: 'i', render, mount, move, unmount },
}

// Internal

let htmlParent: HTMLElement | undefined = undefined

function defineHtmlTag<E extends HTMLElement>(id: string, render: Render<E>, type: Type<E>): void {
  define(id, render, type)
}

function render<E extends HTMLElement>(node: Node<E>, cycle: number): void {
  const outer = htmlParent
  try { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const self = node.linker!.element!
    htmlParent = self
    node.render(self, cycle)
  }
  finally {
    htmlParent = outer
  }
}

function mount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = htmlParent!
  const e = document.createElement(node.type.name) as E
  const prev = after?.linker?.element
  if (prev instanceof HTMLElement)
    parent.insertBefore(e, prev.nextSibling)
  else
    parent.appendChild(e)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.linker!.element = e
}

function move<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = htmlParent!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = node.linker?.element!
  const prev = after?.linker?.element
  if (prev instanceof HTMLElement && prev.nextSibling !== e)
    parent.insertBefore(e, prev.nextSibling)
}

function unmount<E extends HTMLElement>(node: Node<E>, outer: Node<unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = node.linker!.element! // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  e.parentElement!.removeChild(e)
}
