// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Apply, define } from '~/viewtronic/api'
import { HtmlNodeRtti } from '~/viewtronic/html.impl'

export function div(id: string, apply: Apply<HTMLDivElement>): void {
  define(id, apply, HtmlRtti.div)
}

export function button(id: string, apply: Apply<HTMLButtonElement>): void {
  define(id, apply, HtmlRtti.button)
}

export function span(id: string, apply: Apply<HTMLSpanElement>): void {
  define(id, apply, HtmlRtti.span)
}

export function italic(id: string, apply: Apply<HTMLSpanElement>): void {
  define(id, apply, HtmlRtti.italic)
}

// Static (non-reactive)

export function staticDiv(id: string, apply: Apply<HTMLDivElement>): void {
  define(id, apply, HtmlRtti.StaticDiv)
}

export function staticButton(id: string, apply: Apply<HTMLButtonElement>): void {
  define(id, apply, HtmlRtti.StaticButton)
}

export function staticSpan(id: string, apply: Apply<HTMLSpanElement>): void {
  define(id, apply, HtmlRtti.StaticSpan)
}

export function staticItalic(id: string, apply: Apply<HTMLSpanElement>): void {
  define(id, apply, HtmlRtti.StaticItalic)
}

// Run-Time Type Information

const HtmlRtti = {
  div: new HtmlNodeRtti<HTMLDivElement>('div', true),
  button: new HtmlNodeRtti<HTMLButtonElement>('button', true),
  span: new HtmlNodeRtti<HTMLSpanElement>('span', true),
  italic: new HtmlNodeRtti<HTMLSpanElement>('i', true),
  StaticDiv: new HtmlNodeRtti<HTMLDivElement>('div', false),
  StaticButton: new HtmlNodeRtti<HTMLButtonElement>('button', false),
  StaticSpan: new HtmlNodeRtti<HTMLSpanElement>('span', false),
  StaticItalic: new HtmlNodeRtti<HTMLSpanElement>('i', false),
}
