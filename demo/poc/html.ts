// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Render, Rx, RxChildren } from './api'

export interface DivModel {
  className?: string
  style?: any
  innerHTML?: string
}

export function div(model: DivModel, children?: () => RxChildren): Rx<DivModel, HTMLDivElement> {
  return html(div.name, model, children)
}

export function span(model: DivModel, children?: () => RxChildren): Rx<DivModel, HTMLSpanElement> {
  return html(span.name, model, children)
}

export function i(model: DivModel, children?: () => RxChildren): Rx<DivModel, HTMLSpanElement> {
  return html(i.name, model, children)
}

// Internal

function html<View extends HTMLElement>(tag: string, model: unknown, children?: () => RxChildren): Rx<any, View> {
  return { type: tag, key: undefined, model, view: undefined, render, children, mount, unmount }
}

function render(m: unknown, v: HTMLElement): void {
  // v.className = m.className || ''
  // v.innerHTML = m.innerHTML || ''
}

function mount<View extends HTMLElement>(rx: Rx<unknown, View>, outer: HTMLElement): void {
  rx.view = outer.appendChild(document.createElement(rx.type)) as View
}

function unmount<View extends HTMLElement>(rx: Rx<unknown, View>, outer: HTMLElement): void {
  if (rx.view) {
    outer.removeChild(rx.view)
    rx.view = undefined
  }
}
