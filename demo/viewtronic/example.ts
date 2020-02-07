// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css, cx } from 'emotion'
import { Action, action, Stateful } from 'reactronic'

import { div, ReactiveDiv } from '~/viewtronic/html'

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
    ReactiveDiv('(mouse)', e => {
      e.className = style.classes.toolbarItem
      e.style.border = 'none'
      e.style.borderBottom = '0.5px solid white'
      e.innerText = `Mouse: ${model.x}, ${model.y} (${model.clicks})`
      model.setMeasure(e.clientWidth)
    })
    ReactiveDiv('(space)', e => {
      e.className = style.classes.toolbarItem
      e.style.border = 'none'
      e.style.flexGrow = '1'
      e.style.textAlign = 'right'
      e.innerText = `Width: ${model.measure}`
    })
    ToolbarButton('Settings', 'las la-cog')
    ToolbarButton('Close', 'las la-times')
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

export function ToolbarButton(id: string, icon: string): void {
  ReactiveDiv(id, e => {
    e.className = style.classes.toolbarItem
    div('icon', e => e.className = cx(icon, style.classes.toolbarIcon))
    div('text', e => {
      e.className = style.classes.toolbarText
      e.innerText = `${id}`
    })
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
    toolbarItem: css`
      label: toolbarButton;
      margin: 1em;
      padding: 0.5em;
      border: 0.5px dashed gray;
    `,
    toolbarIcon: css`
      label: toolbarButtonIcon;
    `,
    toolbarText: css`
      label: toolbarButtonText;
    `,
  }
})
