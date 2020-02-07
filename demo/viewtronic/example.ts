// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css, cx } from 'emotion'
import { Action, action, Stateful } from 'reactronic'

import { renderChildren } from '~/viewtronic/api'
import { div, italic, ReactiveDiv } from '~/viewtronic/html'

import { restyle } from '../../source/tools/restyle'

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

export function App(id: string): void {
  div(id, e => {
    e.className = style.classes.app
    e.onclick = e => model.click()
    e.onmousemove = e => model.move(e.x, e.y)
    Toolbar('toolbar')
  })
}

export function Toolbar(id: string): void {
  div(id, e => {
    e.className = style.classes.toolbar
    ToolbarButton('Menu', 'las la-menu', true)
    ReactiveDiv('(space)', e => {
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
  //   <ToolbarButton id="Menu" icon="las la-menu">Menu</ToolbarButton>
  //   <div id="space" style={{flexGrow: 1}}/>
  //   <ToolbarButton id="Settings" icon="las la-cog"/>Settings</ToolbarButton>
  //   <ToolbarButton id="Close" icon="las la-times">Close</ToolbarButton>
  //   ...
  // </div>
}

export function ToolbarButton(id: string, icon: string, mouse: boolean): void {
  ReactiveDiv(id, e => {
    let measure: HTMLDivElement
    e.className = style.classes.toolbarButton
    div('icon', e => e.className = cx(icon, style.classes.toolbarButtonIcon))
    div('text', e => {
      e.className = style.classes.toolbarButtonText
      e.innerText = mouse ? `${id || ''} ${model.clicks} : ${model.x}, ${model.y}` : `${id || ''} ${model.clicks}`
      measure = e
    })
    // Measure rendered elements
    renderChildren()
    if (mouse) // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      model.setMeasure(measure!.clientWidth)
  })
}

export const style = restyle(() => {
  return {
    app: css`
      label: app;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      margin: 1em;
      padding: 1em;
      border: 0.5px dashed gray;
    `,
    toolbar: css`
      label: toolbar;
      z-index: 100;
      display: flex;
      flex-direction: row;
      border: 0.5px dashed gray;
    `,
    toolbarButton: css`
      label: toolbarButton;
      margin: 1em;
      border: 0.5px dashed gray;
    `,
    toolbarButtonIcon: css`
      label: toolbarButtonIcon;
    `,
    toolbarButtonText: css`
      label: toolbarButtonText;
    `,
  }
})
