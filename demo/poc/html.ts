// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { element, Key, Ref, Render, Rtti } from './api'

export function div(r: Render<HTMLDivElement>, k?: Key): void {
  htmlElem<HTMLDivElement>(r, k, HtmlRtti.div)
}

export function span(r: Render<HTMLSpanElement>, k?: Key): void {
  htmlElem<HTMLSpanElement>(r, k, HtmlRtti.span)
}

export function i(r: Render<HTMLSpanElement>, k?: Key): void {
  htmlElem<HTMLSpanElement>(r, k, HtmlRtti.i)
}

export function t(value: string): void {
  throw new Error('not implemented')
}

const HtmlRtti = {
  div: { name: 'div', acquire, mount, unmount },
  span: { name: 'span', acquire, mount, unmount },
  i: { name: 'i', acquire, mount, unmount },
}

// Internal

function htmlElem<E extends HTMLElement>(render: Render<E>, k: Key, rtti: Rtti<E>): void {
  element(render, k, rtti)
}

function acquire<E extends HTMLElement>(ref: Ref<E>): void {
  let e = ref.element
  if (!e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    e = ref.element = ref.rtti?.mount!(ref)
  ref.render(e, 0)
}

function mount<E extends HTMLElement>(ref: Ref<E>): E {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return document.body.appendChild(document.createElement(ref.rtti!.name)) as E
}

function unmount<E extends HTMLElement>(ref: Ref<E>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.body.removeChild(ref.element!)
  return undefined
}
