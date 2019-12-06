// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// import { VirtualGrid } from '~/../source/reactronic-toolkit-react'
// import { Application } from '~/app/Application'

// import { style } from './AppWindow.css'

// type Ref<T> = { ref: T }
// type Mount<E, A> = (elem: E, args: A) => Rx[] // returns children
// type Refresh<E> = (elem: E, cycle: number) => void
// type Unmount<E> = (elem: E) => void

// export function AppWindow(p: {app: Application}): any {
//   const css = style.classes
//   const grid = p.app.grid
//   const c = grid.component
//   const loader = p.app.loader
//   let btn: any
//   return (
//     e<HTMLDivElement>('div', css.main, () => [
//       f(ScrollBox, css.scroll, {}),
//       f(GridFragment, css.grid, {})]
//     ),
//     e<HTMLDivElement>('div', css.toolbar, () => [
//       e<HTMLButtonElement>('button', css.action, () => [
//         '▼'],
//         e => {
//           // mount(() => {
//           //   e.onClick = () => c ? c.scrollTop += grid.ppcY : {}
//           // }, () => {
//           //   // unmount
//           // })
//           e.disabled = !c
//         }
//       )]
//     ),
//     e<HTMLDivElement>('div', css.debugger, () => [
//       f(ScrollDebugger, undefined, { grid })],
//       e => {
//         // Object.assign(e.style, region(10, 3, 10, 5))
//       },
//     )
//   )
// }

// class Rx {
// }

// function e<E extends HTMLElement>(tag: string, css?: string,
//   mount?: Mount<E, void>, refresh?: Refresh<E>, unmount?: Unmount<E>): Rx {
//   throw new Error('not implemented')
// }

// // function x<T extends { css?: string }>(type: 'div', arg: T, ...children: any[]): any
// function f<A>(type: Refresh<A>, css: string | undefined, arg: A): Rx {
//   throw new Error('not implemented')
// }

// // function x<A>(type: Refresh<A>, css: string | undefined, arg: A): Rx {
// //   throw new Error('not implemented')
// // }

// // function div(cls: string | undefined, render: ((e: any) => void) | null, ...children: any[]): any {
// // }

// // function button(cls: string | undefined, render: ((e: any) => void) | null, ...children: any[]): any {
// // }

// function ScrollBox(m: { css?: string }): any {
//   //
// }

// function GridFragment(m: { css?: string }): any {
//   //
// }

// function ScrollDebugger(m: { grid: VirtualGrid }): any {
//   //
// }

// function mount(mount?: () => void, unmount?: () => void): void {
//   //
// }
