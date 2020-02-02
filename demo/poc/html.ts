// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Elem, element, Render, Rtti } from './api'

export function div(id: string, render: Render<HTMLDivElement>): void {
  htmlElem<HTMLDivElement>(id, render, HtmlRtti.div)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  htmlElem<HTMLSpanElement>(id, render, HtmlRtti.span)
}

export function i(id: string, render: Render<HTMLSpanElement>): void {
  htmlElem<HTMLSpanElement>(id, render, HtmlRtti.i)
}

export function t(value: string): void {
  throw new Error('not implemented')
}

const HtmlRtti = {
  div: { hint: 'div', acquire, mount, unmount },
  span: { hint: 'span', acquire, mount, unmount },
  i: { hint: 'i', acquire, mount, unmount },
}

// Internal

function htmlElem<E extends HTMLElement>(id: string, render: Render<E>, rtti: Rtti<E>): void {
  element(id, render, rtti)
}

function acquire<E extends HTMLElement>(elem: Elem<E>): void {
  let e = elem.mounted
  if (!e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    e = elem.mounted = elem.rtti?.mount!(elem)
  elem.render(e, 0)
}

function mount<E extends HTMLElement>(elem: Elem<E>): E {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return document.body.appendChild(document.createElement(elem.rtti!.hint)) as E
}

function unmount<E extends HTMLElement>(elem: Elem<E>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.body.removeChild(elem.mounted!)
  return undefined
}
