// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { define, Render } from '~/viewtronic/api'
import { HtmlNodeRtti } from '~/viewtronic/html.impl'

export function div(id: string, render: Render<HTMLDivElement>): void {
  define(id, render, HtmlRtti.div)
}

export function button(id: string, render: Render<HTMLButtonElement>): void {
  define(id, render, HtmlRtti.button)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, HtmlRtti.span)
}

export function italic(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, HtmlRtti.italic)
}

// Static (non-reactive)

export function staticDiv(id: string, render: Render<HTMLDivElement>): void {
  define(id, render, HtmlRtti.StaticDiv)
}

export function staticButton(id: string, render: Render<HTMLButtonElement>): void {
  define(id, render, HtmlRtti.StaticButton)
}

export function staticSpan(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, HtmlRtti.StaticSpan)
}

export function staticItalic(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, HtmlRtti.StaticItalic)
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
