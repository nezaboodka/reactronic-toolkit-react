// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// API

type Render<Model, Element = HTMLElement> = (model: Model, element: Element, cycle: number) => void
// type Instance<Model, Element> = { kind: Render<Model, Element>, key: string | number, model: Model, element: Element }

interface Lifecycle<Model, Element = HTMLElement> {
  create?(model: Model, outer: HTMLElement): Element
  dispose?(model: Model, element: Element): void
  finalize?(model: Model, element: Element, cascade: boolean): void
  children?(model: Model, element: Element): Array<Render<any, any>>
}

export function lifecycle<Model, Element = HTMLElement>(render: Render<Model, Element>): Lifecycle<Model, Element> {
  return render as Lifecycle<Model, Element>
}

// Example

export type DivProps = { className?: string, innerHTML?: string}

export function div(props: DivProps, e: HTMLDivElement): void {
  e.className = props.className || ''
  e.innerHTML = props.innerHTML || ''
}

lifecycle(div).create = function(props: DivProps, outer: HTMLElement): HTMLDivElement {
  return outer.appendChild(document.createElement('div'))
}

lifecycle(div).finalize = function(props: DivProps, e: HTMLDivElement): void {
  e.parentElement?.removeChild(e)
}

// Example

export function example(m: string, c: Console, cycle: number): void {
  c.log(`render ${m}.${cycle}`)
}

lifecycle(example).create = function(m: string): Console {
  const target = console
  target.log(`mount ${m} @ ${this}`)
  return target
}

lifecycle(example).finalize = function(m: string, v: Console): void {
  v.log(`unmount ${m} @ ${this}`)
}

export function z(): void {
  const model = 'rx1'
  const c = lifecycle(example)
  const view = c.create ? c.create(model, document.createElement('dev')) : console
  example(model, view, 0)
  if (c.finalize)
    c.finalize(model, view, false)
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
