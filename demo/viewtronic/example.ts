// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, action, Stateful } from 'reactronic'

import { div, italic, ReactiveDiv } from '~/viewtronic/html'
import { renderChildren } from '~/viewtronic/impl'

// Model

export class Model extends Stateful {
  x: number = 0
  y: number = 0
  clicks: number = 0
  measure: number = 0

  @action
  move(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  @action
  click(): void {
    this.clicks++
  }

  @action
  setMeasure(value: number): void {
    this.measure = value
  }
}

const model = Action.run('init', () => new Model())

// Views

export function App(id: string, className: string): void {
  div(id, e => {
    const css = e.style
    e.className = className
    css.position = 'absolute'
    css.top = css.bottom = css.left = css.right = '0'
    css.display = 'flex'
    css.flexDirection = 'column'
    css.margin = '1em'
    css.padding = '1em'
    css.border = '0.5px dashed gray'
    e.onclick = e => model.click()
    e.onmousemove = e => model.move(e.x, e.y)
    Toolbar('toolbar', 'fancy-toolbar')
  })
}

export function Toolbar(id: string, className: string): void {
  div(id, e => {
    const css = e.style
    e.className = className
    css.zIndex = '100'
    css.display = 'flex'
    css.flexDirection = 'row'
    css.border = '0.5px dashed gray'
    // Children
    ToolbarButton('Menu', 'las la-menu', true)
    ReactiveDiv('space', e => {
      const css = e.style
      css.flexGrow = '1'
      css.textAlign = 'center'
      css.margin = '1em'
      e.innerText = `Menu Item Width: ${model.measure}`
    })
    ToolbarButton('Settings', 'las la-cog', false)
    ToolbarButton('Close', 'las la-times', false)
  })
  // Similar in TSX:
  // <div id={id} className={className}>
  //   <ToolbarButton id="menu" icon="las la-menu" caption="Menu"/>
  //   <div id="spring" style={{flexGrow: 1}}/>
  //   <ToolbarButton id="settings" icon="las la-cog" caption="Settings"/>
  //   <ToolbarButton id="close" icon="las la-times" caption="Close"/>
  //   ...
  // </div>
}

export function ToolbarButton(id: string, icon: string, mouse: boolean): void {
  ReactiveDiv(id, e => {
    let measure: HTMLDivElement

    e.className = 'fancy-button'
    e.style.margin = '1em'
    e.style.border = '0.5px dashed gray'

    div('icon', e => {
      e.className = 'fancy-button-icon'
      italic('sym', el => el.className = icon)
    })

    div('text', e => {
      e.className = 'fancy-button-text'
      e.innerText = mouse ? `${id || ''} ${model.clicks} : ${model.x}, ${model.y}` : `${id || ''} ${model.clicks}`
      measure = e
    })

    renderChildren()
    if (mouse) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      model.setMeasure(measure!.clientWidth)
  })
}
