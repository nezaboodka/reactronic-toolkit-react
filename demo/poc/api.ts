// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

export function reactive<T = void>(id: string, render: Render<T>, rtti?: Rtti<T>): void {
  element(id, render, rtti)
  // const outer = buffer
  // try {
  //   console.log(e)
  // }
  // finally {
  //   buffer = outer
  // }
}

export function element<E = void>(id: string, render: Render<E>, rtti?: Rtti<E>): void {
  // const elem: Elem<any> = { rtti, id, render }
  // if (!buffer) {
  //   buffer = new Buffer()
  //   render()
  // }
  // else
  //   buffer.children.push(ref)
}

export function flush(): void {
  const c = current // shorthand
  if (c) {
    for (let i = c.flushed; i < c.children.length; i++) {
      // acquire/mount/render
    }
    c.flushed = c.children.length
  }
}

export type Render<E = void> = (elem: E, cycle: number) => void

export interface Elem<E = void> {
  rtti?: Rtti<E>
  id?: string
  mounted?: E
  render: Render<E>
}

export interface Rtti<E = void> {
  hint: string
  acquire?(elem: Elem<E>): void
  mount?(elem: Elem<E>): E
  unmount?(elem: Elem<E>): undefined
}

// Internal

class Node {
  outer?: unknown = undefined
  parent?: Elem<unknown> = undefined
  self: Elem<unknown> = { render: () => { /* */ }}
  children: Array<Elem<unknown>> = []
  flushed: number = 0
}

let current: Node | undefined = undefined

function build(elem: Elem<unknown>): void {
  current = new Node()
  elem.render(elem.mounted, 0)
  for (const x of current.children) {
    //
  }
  current = undefined
}
