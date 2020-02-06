// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { define, Node, proceed, Render, Rtti } from '~/viewtronic/api'

// Tags

export function div(id: string, content: Render<HTMLDivElement>): void {
  define(id, content, Html.div)
}

export function span(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, Html.span)
}

export function i(id: string, render: Render<HTMLSpanElement>): void {
  define(id, render, Html.i)
}

// Internal

class HtmlNodeRtti<E extends HTMLElement> implements Rtti<E> {
  static root: HTMLElement = document.body
  static self = HtmlNodeRtti.root

  constructor(
    readonly name: string,
    readonly reactive: boolean) {
  }

  proceed(node: Node<E>): void {
    // console.log(`enter: <${node.rtti.name}> #${node.id}...`)
    const outer = HtmlNodeRtti.self
    try { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      HtmlNodeRtti.self = node.linker!.element!
      proceed(node)
    }
    finally {
      HtmlNodeRtti.self = outer
    }
    // console.log(`leave: <${node.rtti.name}> #${node.id}`)
  }

  mount(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void {
    const parent = HtmlNodeRtti.self
    const prev = after?.linker?.element
    const e = document.createElement(node.rtti.name) as E
    e.id = node.id
    if (prev instanceof HTMLElement)
      parent.insertBefore(e, prev.nextSibling)
    else
      parent.appendChild(e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node.linker!.element = e
    // console.log(`  mounted: <${node.rtti.name}> #${node.id}`)
  }

  ordering(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void {
    const parent = HtmlNodeRtti.self
    const prev = after?.linker?.element
    const e = node.linker?.element
    if (e && prev instanceof HTMLElement && prev.nextSibling !== e) {
      parent.insertBefore(e, prev.nextSibling)
      // console.log(`  reordered: <${node.rtti.name}> #${node.id}`)
    }
  }

  unmount(node: Node<E>, owner: Node<unknown>): void {
    const e = node.linker?.element
    if (e && e.parentElement)
      e.parentElement.removeChild(e)
    // console.log(`  unmounted: <${node.rtti.name}> #${node.id}`)
  }
}

const Html = {
  div: new HtmlNodeRtti<HTMLDivElement>('div', false),
  span: new HtmlNodeRtti<HTMLSpanElement>('span', false),
  i: new HtmlNodeRtti<HTMLSpanElement>('i', false),
}
