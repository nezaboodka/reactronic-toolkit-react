// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Stateful, trigger } from 'reactronic'

// Render, Node, Type, Linker

export type Render<E = void> = (element: E) => void

export interface Node<E = void> {
  readonly id: string
  readonly render: Render<E>
  readonly type: Type<E>
  linker?: Linker<E>
}

export interface Type<E = void> {
  readonly name: string
  embrace?(node: Node<E>): void
  mount?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  ordering?(node: Node<E>, outer: Node<unknown>, after?: Node<unknown>): void
  unmount?(node: Node<E>, outer: Node<unknown>): void
}

export interface Linker<E = void> {
  element?: E
  reconciling?: Array<Node<unknown>> // children in natural order
  index: Array<Node<unknown>> // sorted children
}

// reactive, define, renderNode, renderChildren

export function reactive<E = void>(id: string, render: Render<E>, type: Type<E>): void {
  const node: Node<any> = new RxNode<E>(id, render, type)
  def(node)
}

export function define<E = void>(id: string, render: Render<E>, type: Type<E>): void {
  const node: Node<any> = { id, render, type: type || DefaultNodeType }
  def(node)
}

export function applyNode<E>(node: Node<E>): void {
  const linker = node.linker
  if (!linker)
    throw new Error('node must be mounted before rendering')
  linker.reconciling = [] // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  node.render(linker.element!)
  applyChildren() // ignored if rendered already
}

export function applyChildren(): void {
  // console.log(`rendering children: <${self.type.name}> #${self.id}`)
  const self = Context.self
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
      apply(x)
      prev = x
    }
  }
  // console.log(`rendered children: <${self.type.name}> #${self.id}`)
}

// Internal: Context

const DefaultRender: Render<unknown> = () => { /* nop */ }
const DefaultNodeType: Type<unknown> = { name: '<unknown>' }

class Context {
  static global: Node<unknown> = {
    id: '<global>',
    render: DefaultRender,
    type: DefaultNodeType,
    linker: { index: [] }
  }
  static self = Context.global
}

function def(node: Node<unknown>): void {
  // console.log(`< defining: <${rtti.name}> #${id}...`)
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
    applyChildren()
  }
  // console.log(`/> defined: <${rtti.name}> #${id}`)
}

function apply(node: Node<unknown>): void {
  const outer = Context.self
  try {
    Context.self = node
    if (node.type.embrace)
      node.type.embrace(node)
    else
      applyNode(node)
  }
  finally {
    Context.self = outer
  }
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
        if (a.type === b.type && a.render !== b.render)
          reindexed[j] = a // reuse existing instance in whole
        else
          b.linker = a.linker // reuse existing linker only
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
  readonly rerender: Render<E>
  readonly type: Type<E>
  linker?: Linker<E> | undefined

  constructor(id: string, render: Render<E>, type: Type<E>) {
    this.id = id
    this.type = type
    this.rerender = render
    this.linker = undefined
  }

  @trigger
  render(element: E): void {
    this.rerender(element)
  }
}
