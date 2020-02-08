// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { apply, Node, Rtti } from '~/viewtronic/api'

export class HtmlNodeRtti<E extends HTMLElement> implements Rtti<E> {
  constructor(
    readonly name: string,
    readonly reactive: boolean) {
  }

  apply(self: Node<E>): void {
    // console.log(`enter: <${node.rtti.name}> #${node.id}...`)
    const outer = HtmlNodeRtti.current
    try { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      HtmlNodeRtti.current = self.instance!.element!
      apply(self)
    }
    finally {
      HtmlNodeRtti.current = outer
    }
    // console.log(`leave: <${node.rtti.name}> #${node.id}`)
  }

  mount(self: Node<E>, outer: Node, after?: Node): void {
    const parent = HtmlNodeRtti.current
    const prevSibling = after?.instance?.element
    const e = document.createElement(self.rtti.name) as E
    e.id = self.id
    if (prevSibling instanceof HTMLElement)
      parent.insertBefore(e, prevSibling.nextSibling)
    else
      parent.appendChild(e) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    self.instance!.element = e
    // console.log(`  mounted: <${node.rtti.name}> #${node.id}`)
  }

  order(self: Node<E>, outer: Node, after?: Node): void {
    const parent = HtmlNodeRtti.current
    const prevSibling = after?.instance?.element
    const e = self.instance?.element
    if (e && prevSibling instanceof HTMLElement && prevSibling.nextSibling !== e) {
      parent.insertBefore(e, prevSibling.nextSibling)
      // console.log(`  reordered: <${node.rtti.name}> #${node.id}`)
    }
  }

  unmount(self: Node<E>, outer: Node, cause: Node): void {
    if (cause.instance === self.instance) {
      const e = self.instance?.element
      if (e && e.parentElement)
        e.parentElement.removeChild(e)
      // console.log(`  unmounted: <${node.rtti.name}> #${node.id}`)
    }
  }

  static current = document.body
}
