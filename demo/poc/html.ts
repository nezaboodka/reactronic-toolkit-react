// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { element, ElementToken, ElementType, getOuter, Render } from './api'

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
  div: { hint: 'div', resolve, mount, unmount },
  span: { hint: 'span', resolve, mount, unmount },
  i: { hint: 'i', resolve, mount, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: ElementType<E>): void {
  element(id, render, type)
}

function resolve<E extends HTMLElement>(children: Array<ElementToken<E>>, start: number, count: number): void {
  // const outer = getOuter<HTMLElement>()
  // let e = outer.children.namedItem(et.id) as E
  // if (!e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   e = et.type?.mount!(et)
  // et.impl = e
  throw new Error('not implemented')
}

function mount<E extends HTMLElement>(et: ElementToken<E>): E {
  const outer = getOuter<HTMLElement>() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const e = document.createElement(et.type!.hint) as E
  outer.appendChild(e)
  et.element = e
  return e
}

function unmount<E extends HTMLElement>(et: ElementToken<E>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.body.removeChild(et.element!)
  return undefined
}
