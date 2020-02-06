// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Cache, trigger } from 'reactronic'

// Render, Node, Rtti, Linker

export type Render<E = void> = (element: E) => void

export interface Node<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly rtti: Rtti<E>
  linker?: Linker<E>
}

export interface Rtti<E = void> {
  readonly name: string
  readonly reactive: boolean
  proceed?(node: Node<E>): void
  mount?(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void
  ordering?(node: Node<E>, owner: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, owner: Node<unknown>): void
}

export interface Linker<E = void> {
  element?: E
  index: Array<Node<unknown>> // sorted children
  pending?: Array<Node<unknown>> // children in natural order
  reactiveRender(node: Node<E>): void
}

// reactive, define, render, renderChildren, continueRender

export function reactive<E = void>(id: string, hint: string, render: Render<E>): void {
  define(id, render, { name: hint, reactive: true })
}

export function define<E = void>(id: string, render: Render<E>, rtti?: Rtti<E>): void {
  const node: Node<any> = { id, render, rtti: rtti || DefaultNodeType }
  // console.log(`< defining: <${node.rtti.name}> #${node.id}...`)
  const parent = LinkerImpl.self // shorthand
  const linker = parent.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (parent !== LinkerImpl.global) {
    if (!linker.pending)
      throw new Error('children are rendered already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    linker.pending.push(node)
  }
  else { // render root immediately
    linker.pending = [node]
    renderChildren()
  }
  // console.log(`/> defined: <${node.rtti.name}> #${node.id}`)
}

export function render(node: Node<any>): void {
  if (node.rtti.reactive)
    node.linker?.reactiveRender(node)
  else
    LinkerImpl.basicRender(node)
}

export function renderChildren(): void {
  const self = LinkerImpl.self
  // console.log(`rendering children: <${self.rtti.name}> #${self.id}`)
  const children = reconcile(self)
  if (children) {
    let prev: Node<unknown> | undefined = undefined
    for (const x of children) {
      if (!x.linker) { // if not yet mounted
        x.linker = new LinkerImpl<unknown>()
        if (x.rtti.mount)
          x.rtti.mount(x, self, prev)
      }
      else if (x.rtti.ordering)
        x.rtti.ordering(x, self, prev)
      render(x)
      prev = x
    }
  }
  // console.log(`rendered children: <${self.rtti.name}> #${self.id}`)
}

export function proceed(node: Node<any>): void {
  const outer = LinkerImpl.self
  try {
    LinkerImpl.self = node
    const linker = node.linker
    if (!linker)
      throw new Error('node must be mounted before rendering')
    linker.pending = []
    // console.log(` (!) rendering ${node.rtti.name} #${node.id}...`)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node.render(linker.element!)
    renderChildren() // ignored if rendered already
    // console.log(` (!) rendered ${node.rtti.name} #${node.id}`)
  }
  finally {
    LinkerImpl.self = outer
  }
}

// Internal: Context

const DefaultRender: Render<any> = () => { /* nop */ }
const DefaultNodeType: Rtti<any> = { name: '<default>', reactive: false }

class LinkerImpl<E> implements Linker<E> {
  element?: E
  index: Node<unknown>[] = []
  pending?: Node<unknown>[]

  @trigger
  reactiveRender(node: Node<E>): void {
    LinkerImpl.basicRender(node)
  }

  static basicRender<E>(node: Node<E>): void {
    if (node.rtti.proceed)
      node.rtti.proceed(node)
    else
      proceed(node)
  }

  static global: Node<unknown> = { id: '<global>', render: DefaultRender, rtti: DefaultNodeType, linker: new LinkerImpl<unknown>() }
  static self: Node<unknown> = LinkerImpl.global
}

function reconcile(self: Node<unknown>): Array<Node<unknown>> | undefined {
  const linker = self.linker
  const children = linker?.pending
  if (linker && children) {
    // console.log(`  reconciling: <${self.rtti.name}> #${self.id}...`)
    linker.pending = undefined
    const reindexed = children.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    let i = 0, j = 0
    while (i < linker.index.length) {
      const a = linker.index[i]
      const b = reindexed[j]
      if (a.id < b.id) {
        if (b.rtti.unmount)
          b.rtti.unmount(b, self) // TODO: mitigate the risk of exception
        if (b.rtti.reactive)
          Cache.unmount(b.linker)
        b.linker = undefined
        i++
      }
      else if (a.id === b.id) {
        b.linker = a.linker
        i++
        j++
      }
      else // a.id > b.id
        j++
    }
    linker.index = reindexed
    // console.log(`  reconciled: <${self.rtti.name}> #${self.id}`)
  }
  return children
}
