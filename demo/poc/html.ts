// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { element, ElementChildren, ElementToken, ElementType, getOuter, Render } from './api'

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
  div: { hint: 'div', reconcile, mount, unmount },
  span: { hint: 'span', reconcile, mount, unmount },
  i: { hint: 'i', reconcile, mount, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: ElementType<E>): void {
  element(id, render, type)
}

function reconcile<E extends HTMLElement>(self: ElementToken<E>, children: ElementChildren): ElementChildren {
  const outer = getOuter<HTMLElement>()
  const existing: Array<Element | null> = []
  for (let i = 0; i < outer.children.length; i++)
    existing.push(outer.children.item(i))
  existing.sort()
  throw new Error('not implemented')
}

function mount<E extends HTMLElement>(self: ElementToken<E>): E {
  const outer = getOuter<HTMLElement>() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = document.createElement(self.type!.hint) as E
  outer.appendChild(e)
  self.element = e
  return e
}

function unmount<E extends HTMLElement>(self: ElementToken<E>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.body.removeChild(self.element!)
  return undefined
}
