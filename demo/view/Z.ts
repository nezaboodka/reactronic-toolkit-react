// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

type View<M = void, T = void> = Render<M, T> & LifeCycle<M, T>

type Render<M, T> = (model: M, cycle: number, target: T) => void

interface LifeCycle<M, T> {
  mount?(model: M): T
  children?(model: M, target: T): Array<View<any, any>>
  unmount?(model: M, target: T): void
}

// Example

export function div(m: { className?: string, innerHTML?: string }, cycle: number, t: HTMLDivElement): void {
  t.className = m.className || ''
  t.innerHTML = m.innerHTML || ''
}

div.mount = function (m: { className?: string, innerHTML?: string }): HTMLDivElement {
  return document.createElement('div')
}

div.unmount = function (m: string, t: HTMLDivElement): void {
  t.parentElement?.removeChild(t)
}

// Example

const example: View<string, Console> = function(m: string, cycle: number, target: Console): void {
  target.log(`render ${m}.${cycle}`)
}

example.mount = function (m: string): Console {
  const target = console
  target.log(`mount ${m} @ ${this}`)
  return target
}

example.unmount = function(m: string, target: Console): void {
  target.log(`unmount ${m} @ ${this}`)
}

export function z(): void {
  const model = 'rx1'
  const target = example.mount ? example.mount(model) : console
  example(model, 0, target)
  if (example.unmount)
    example.unmount(model, target)
}

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
