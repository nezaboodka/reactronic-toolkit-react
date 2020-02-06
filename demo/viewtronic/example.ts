// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, action, Stateful } from 'reactronic'

import { div, i } from '~/viewtronic/html'
import { reactive } from '~/viewtronic/impl'

class Model extends Stateful {
  tick: number = 0
  x: number = 0
  y: number = 0

  @action
  click(): void {
    this.tick++
  }

  @action
  mouse(x: number, y: number): void {
    this.x = x
    this.y = y
  }
}

const model = Action.run('init', () => new Model())

export function Toolbar(id: string, className: string): void {
  div(id, e => {
    e.className = className
    e.style.zIndex = '100'
    e.style.display = 'flex'
    e.style.flexDirection = 'row'
    e.onclick = e => model.click()
    e.onmousemove = e => model.mouse(e.x, e.y)
    ToolbarButton('menu', 'las la-menu', 'Menu')
    div('spring', e => e.style.flexGrow = '1')
    ToolbarButton('settings', 'las la-cog', 'Settings')
    ToolbarButton('close', 'las la-times', 'Close')
  })
  // Same in TSX:
  // <div id={id} className={className}>
  //   <ToolbarButton id="menu" icon="las la-menu" caption="Menu"/>
  //   <div id="spring" style={{flexGrow: 1}}/>
  //   <ToolbarButton id="settings" icon="las la-cog" caption="Settings"/>
  //   <ToolbarButton id="close" icon="las la-times" caption="Close"/>
  //   ...
  // </div>
}

export function ToolbarButton(id: string, icon: string, caption?: string): void {
  reactive(id, ToolbarButton.name, () => {
    // let measure: HTMLDivElement

    div(id, e => {
      e.className = 'fancy-button'
      e.style.margin = '1em'

      div('icon', e => {
        e.className = 'fancy-button-icon'
        i('sym', el => el.className = icon)
      })

      div('text', e => {
        e.className = 'fancy-button-text'
        e.innerText = `${caption || ''} ${model.tick} : ${model.x}, ${model.y}`
        // measure = e
      })
    })

    // renderChildren() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // console.log(`measured: ${measure!.clientHeight}`)
  })
}
