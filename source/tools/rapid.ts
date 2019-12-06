// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// import { Cache, cached, State, trigger } from 'reactronic'

// type Elem = HTMLElement | Rx

// export function div(render?: (e: HTMLDivElement) => void): HTMLElement {
//   const e = document.createElement('div')
//   if (render)
//     render(e)
//   return e
// }

// export function comp(render: () => void, getChildren: () => Rx[]): Elem | Array<Elem> {
//   const rx = new Rx(render, getChildren)
//   return rx
// }

// class Rx extends State {
//   private readonly refreshSelf: () => void
//   private readonly getChildren: () => Rx[]

//   constructor(refreshSelf: () => void, getChildren: () => Rx[]) {
//     super()
//     this.refreshSelf = refreshSelf
//     this.getChildren = getChildren
//   }

//   @cached
//   render(): this {
//     this.refreshSelf()
//     return this
//   }

//   @cached
//   children(): Array<string | number> {
//     throw new Error('not implemented')
//   }

//   @trigger
//   protected pulse(): void {
//     if (Cache.of(this.render).invalid)
//       this.render()
//     // if (Cache.of(this.children).invalid)
//     //   this.getChildren()
//   }
// }
