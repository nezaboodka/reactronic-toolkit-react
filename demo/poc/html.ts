// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { element, ElementToken, ElementType, Render } from './api'

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
  div: { hint: 'div', acquire, mount, unmount },
  span: { hint: 'span', acquire, mount, unmount },
  i: { hint: 'i', acquire, mount, unmount },
}

// Internal

function html<E extends HTMLElement>(id: string, render: Render<E>, type: ElementType<E>): void {
  element(id, render, type)
}

function acquire<E extends HTMLElement>(et: ElementToken<E>): void {
  let mounted = et.mounted
  if (!mounted) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mounted = et.mounted = et.type?.mount!(et)
  et.render(mounted, 0)
}

function mount<E extends HTMLElement>(et: ElementToken<E>): E {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return document.body.appendChild(document.createElement(et.type!.hint)) as E
}

function unmount<E extends HTMLElement>(et: ElementToken<E>): undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.body.removeChild(et.mounted!)
  return undefined
}
