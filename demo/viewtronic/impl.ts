// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Stateful, trigger } from 'reactronic'

// Render, Node, Type, Linker

export type Render<E = void> = (element: E) => void

export interface Node<E = void> {
  readonly id: string
  readonly reactiveRender: Render<E>
  readonly type: Type<E>
  linker?: Linker<E>
}

export interface Type<E = void> {
  readonly name: string
  render?(node: Node<E>): void
  mount?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  ordering?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface Linker<E = void> {
  element?: E
  reconciling?: Array<Node<unknown>> // children in natural order
  index: Array<Node<unknown>> // sorted children
}

// reactive, define, renderAll, renderChildren, continueRender

export function reactive<E = void>(id: string, render: Render<E>, type?: Type<E>): void {
  const node: Node<any> = new RxNode<E>(id, render, type || DefaultRxNodeType)
  def(node)
}

export function define<E = void>(id: string, render: Render<E>, type?: Type<E>): void {
  const node: Node<any> = { id, reactiveRender: render, type: type || DefaultNodeType }
  def(node)
}

export function renderNodeAndChildren(node: Node<any>): void {
  if (node.type.render)
    node.type.render(node)
  else
    continueRender(node)
}

export function renderChildren(): void {
  const self = Context.self
  // console.log(`rendering children: <${self.type.name}> #${self.id}`)
  const children = reconcile(self)
  if (children) {
    let prev: Node<unknown> | undefined = undefined
    for (const x of children) {
      if (!x.linker) { // if not yet mounted
        x.linker = { index: [] }
        if (x.type.mount)
          x.type.mount(x, self, prev)
      }
      else if (x.type.ordering)
        x.type.ordering(x, self, prev)
      renderNodeAndChildren(x)
      prev = x
    }
  }
  // console.log(`rendered children: <${self.type.name}> #${self.id}`)
}

export function continueRender(node: Node<any>): void {
  const outer = Context.self
  try {
    Context.self = node
    const linker = node.linker
    if (!linker)
      throw new Error('node must be mounted before rendering')
    linker.reconciling = []
    // console.log(` (!) rendering ${node.type.name} #${node.id}...`)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node.reactiveRender(linker.element!)
    renderChildren() // ignored if rendered already
    // console.log(` (!) rendered ${node.type.name} #${node.id}`)
  }
  finally {
    Context.self = outer
  }
}

// Internal: Context

const DefaultRender: Render<any> = () => { /* nop */ }
const DefaultNodeType: Type<any> = { name: '<unknown>' }

class Context {
  static global: Node<unknown> = {
    id: '<global>',
    reactiveRender: DefaultRender,
    type: DefaultNodeType,
    linker: { index: [] }
  }
  static self = Context.global
}

function def(node: Node<unknown>): void {
  // console.log(`< defining: <${node.type.name}> #${node.id}...`)
  const parent = Context.self // shorthand
  const linker = parent.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  if (parent !== Context.global) {
    if (!linker.reconciling)
      throw new Error('children are rendered already') // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    linker.reconciling.push(node)
  }
  else { // render root immediately
    linker.reconciling = [node]
    renderChildren()
  }
  // console.log(`/> defined: <${node.type.name}> #${node.id}`)
}

function reconcile(self: Node<unknown>): Array<Node<unknown>> | undefined {
  const linker = self.linker
  const children = linker?.reconciling
  if (linker && children) {
    // console.log(`  reconciling: <${self.type.name}> #${self.id}...`)
    linker.reconciling = undefined
    const reindexed = children.slice().sort((n1, n2) => n1.id.localeCompare(n2.id))
    let i = 0, j = 0
    while (i < linker.index.length) {
      const a = linker.index[i]
      const b = reindexed[j]
      if (a.id < b.id) {
        if (b.type.unmount)
          b.type.unmount(b, self) // TODO: mitigate the risk of exception
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
    // console.log(`  reconciled: <${self.type.name}> #${self.id}`)
  }
  return children
}

// RxNode

export class RxNode<E> implements Node<E> {
  readonly id: string
  readonly reactiveRender: Render<E>
  readonly type: Type<E>
  linker?: Linker<E> | undefined

  constructor(id: string, render: Render<E>, type: Type<E>) {
    this.id = id
    this.type = type
    this.reactiveRender = render
    this.linker = undefined
  }

  @trigger
  protected refresh(): void {
    continueRender(this)
  }

  static reactiveRender(node: RxNode<any>): void {
    node.refresh()
  }
}

const DefaultRxNodeType: Type<any> = { name: '<RxNode>', render: RxNode.reactiveRender }

