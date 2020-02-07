// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Node, proceed, Rtti } from '~/viewtronic/api'

export class HtmlNodeRtti<E extends HTMLElement> implements Rtti<E> {
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

  static root: HTMLElement = document.body
  static self = HtmlNodeRtti.root
}
