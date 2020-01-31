// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

export function reactive<T = void>(render: Render<T>, key?: Key, rtti?: Rtti<T>): void {
  element(render, key, rtti)
  // const outer = buffer
  // try {
  //   console.log(e)
  // }
  // finally {
  //   buffer = outer
  // }
}

export function element<E = void>(render: Render<E>, key?: Key, rtti?: Rtti<E>): void {
  const ref: Ref<any> = { rtti, key, render }
  buffer.children.push(ref)
}

export function flush(): void {
  throw new Error('not implemented')
}

export type Key = string | number | undefined | null | void
export type Render<E = void> = (element: E, cycle: number) => void

export interface Ref<E = void> {
  rtti?: Rtti<E>
  key?: Key
  element?: E
  render: Render<E>
}

export interface Rtti<E = void> {
  name: string
  acquire?(ref: Ref<E>): void
  mount?(ref: Ref<E>): E
  unmount?(ref: Ref<E>): undefined
}

// Internal

class Buffer {
  self: Ref<unknown> = { render: () => { /* */ }}
  children: Array<Ref<unknown>> = []
}

const buffer: Buffer = new Buffer()

// // Example - Button

// export function Button(m: { key?: string, className?: string }, e: HTMLDivElement): void {
//   div({ className: 'button' }, () => [
//     div({ className: 'icon' }),
//     div({ className: 'text' }),
//   ])
// }

// // Example

// export function example(m: string, c: Console, cycle: number): void {
//   c.log(`render ${m}.${cycle}`)
// }

// hooksof(example).create = function(m: string, outer: HTMLElement): Console {
//   const target = console
//   target.log(`create ${m} @ ${this}`)
//   return target
// }

// hooksof(example).remove = function(m: string, e: Console, outer: HTMLElement): void {
//   e.log(`remove ${m} @ ${this}`)
// }

// export function z(): void {
//   const model = 'rx1'
//   const h = hooksof(example)
//   const element = h.create ? h.create(model, document.body) : console
//   example(model, element, 0)
//   if (h.remove)
//     h.remove(model, element, document.body)
// }

// import { VirtualGrid } from '~/../source/reactronic-toolkit-react'
// import { Application } from '~/app/Application'

// import { style } from './AppWindow.css'

// type Ref<T> = { ref: T }
// type Create<E, A> = (elem: E, args: A) => void
// type GetChildren<E, A> = (elem: E, args: A) => Rx[]
// type Refresh<E> = (elem: E, cycle: number) => void
// type Dispose<E> = (elem: E) => void

// export function AppWindow(p: {app: Application}): any {
//   const css = style.classes
//   const grid = p.app.grid
//   const c = grid.component
//   const loader = p.app.loader
//   let btn: any
//   return (
//     div({className: css.main}, () => [
//       x(ScrollBox, {className: css.scroll}, () => [
//         x(GridFragment, {className: css.grid})
//       ]),
//       div({className: css.toolbar}, () => [
//         button(css.action, () => ['▼'],
//           e => {
//             // mount(() => {
//             //   e.onClick = () => c ? c.scrollTop += grid.ppcY : {}
//             // }, () => {
//             //   // unmount
//             // })
//             e.disabled = !c
//           })
//       ]),
//       div(css.debugger, () => [
//         x(undefined, ScrollDebugger, { grid })
//       ], e => {
//         // mount
//         // Object.assign(e.style, region(10, 3, 10, 5))
//       },
//       )
//     ])
//   )
// }

// class Rx {

// }

// function e<E extends HTMLElement>(tag: string, attrs?: { className?: string },
//   create?: Create<E, void>, refresh?: Refresh<E>, dispose?: Dispose<E>): Rx {
//   throw new Error('not implemented')
// }

// // function div(attrs: { className?: string }, create?: Create<HTMLDivElement, void>,
// //   refresh?: Refresh<HTMLDivElement>, dispose?: Dispose<HTMLDivElement>): Rx {
// //   return e('div', attrs, create, refresh, dispose)
// // }

// // function button(attrs?: { className?: string }, create?: Create<HTMLButtonElement, void>,
// //   refresh?: Refresh<HTMLButtonElement>, dispose?: Dispose<HTMLButtonElement>): Rx {
// //   return e('div', attrs, create, refresh, dispose)
// // }

// // function x<T extends { css?: string }>(type: 'div', arg: T, ...children: any[]): any
// function x<A>(type: Refresh<A>, arg: A, children?: GetChildren<Function, A>): Rx {
//   throw new Error('not implemented')
// }

// function xx<A>(type: Refresh<A>, arg: A, children?: GetChildren<Function, A>): Rx {
//   throw new Error('not implemented')
// }

// // function x<A>(type: Refresh<A>, css: string | undefined, arg: A): Rx {
// //   throw new Error('not implemented')
// // }

// // function div(cls: string | undefined, render: ((e: any) => void) | null, ...children: any[]): any {
// // }

// // function button(cls: string | undefined, render: ((e: any) => void) | null, ...children: any[]): any {
// // }

// function div1(attrs: {className?: string}, elem: HTMLDivElement): any {
//   //
// }

// div1.rxCreate = (): HTMLDivElement => { throw new Error('not implemented') }
// div1.rxDelete = (elem: HTMLDivElement): void => { throw new Error('not implemented') }

// function button(attrs: {className?: string}): any {
//   //
// }

// function ScrollBox(m: { className?: string }): any {
//   //
// }

// function GridFragment(m: { className?: string }): any {
//   //
// }

// function ScrollDebugger(m: { grid: VirtualGrid }): any {
//   //
// }

// function mount(mount?: () => void, unmount?: () => void): void {
//   //
// }
