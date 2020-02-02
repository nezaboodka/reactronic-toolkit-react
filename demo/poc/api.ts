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
  // const slot: Slot<any> = { rtti, id, render }
  // if (!buffer) {
  //   buffer = new Buffer()
  //   render()
  // }
  // else
  //   buffer.children.push(ref)
}

export function flush(): void {
  throw new Error('not implemented')
}

export type Render<E = void> = (element: E, cycle: number) => void

export interface Slot<E = void> {
  rtti?: Rtti<E>
  id?: string
  element?: E
  render: Render<E>
}

export interface Rtti<E = void> {
  hint: string
  acquire?(slot: Slot<E>): void
  mount?(slot: Slot<E>): E
  unmount?(slot: Slot<E>): undefined
}

// Internal

class Buffer {
  self: Slot<unknown> = { render: () => { /* */ }}
  children: Array<Slot<unknown>> = []
}

let buffer: Buffer | undefined = new Buffer()

function build(slot: Slot<unknown>): void {
  buffer = new Buffer()
  slot.render(slot.element, 0)
  for (const x of buffer.children) {
    //
  }
  buffer = undefined
}
