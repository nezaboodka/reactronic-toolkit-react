// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { element } from './api'
import { ElementToken, ElementType, Render } from './api.data'

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

function html<E extends HTMLElement>(id: string, render: Render<E>, type: ElementType<E>): void {
  element(id, render, type)
}

function mount<E extends HTMLElement>(self: ElementToken<E>, parent: ElementToken<unknown>): E {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = document.createElement(self.type!.hint) as E
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (parent.element! as HTMLElement).appendChild(e)
  self.element = e
  return e
}

function reconcile<E extends HTMLElement>(self: ElementToken<E>,
  children: Array<ElementToken<unknown>>): Array<ElementToken<unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = self.element!
  const existing: Array<Element | null> = []
  for (let i = 0; i < e.children.length; i++)
    existing.push(e.children.item(i))
  existing.sort()
  throw new Error('not implemented')
}

function unmount<E extends HTMLElement>(self: ElementToken<E>, parent: ElementToken<unknown>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (parent.element! as HTMLElement).removeChild(self.element!)
  return undefined
}
