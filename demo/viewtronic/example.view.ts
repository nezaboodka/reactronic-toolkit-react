// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'

import { model } from '~/viewtronic/example.model'
import { style } from '~/viewtronic/example.style'
import { div } from '~/viewtronic/html'

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
    div('(mouse)', e => {
      e.className = style.classes.toolbarItem
      e.style.border = 'none'
      e.style.borderBottom = '0.5px solid white'
      e.innerText = `Mouse: ${model.x}, ${model.y} (${model.clicks})`
      model.setSize(e.clientWidth)
    })
    div('(space)', e => {
      e.className = style.classes.toolbarItem
      e.style.border = 'none'
      e.style.flexGrow = '1'
      e.style.textAlign = 'right'
      e.innerText = `Width: ${model.size}`
    })
    ToolbarButton('Settings', 'las la-cog')
    ToolbarButton('Close', 'las la-times')
  })
}

export function ToolbarButton(id: string, icon: string): void {
  div(id, e => {
    e.className = style.classes.toolbarItem
    div('icon', e => e.className = cx(icon, style.classes.toolbarIcon))
    div('text', e => {
      e.className = style.classes.toolbarText
      e.innerText = `${id}`
    })
  })
}
