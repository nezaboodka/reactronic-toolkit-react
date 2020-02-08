// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'

import { Model } from '~/viewtronic/example.model'
import { style } from '~/viewtronic/example.style'
import { div } from '~/viewtronic/html'

export function App(id: string, m: Model): void {
  div(id, e => {
    e.className = style.classes.app
    e.onclick = event => m.click()
    e.onmousemove = event => m.move(event.x, event.y)
    Toolbar('toolbar', m)
  })
}

export function Toolbar(id: string, m: Model): void {
  div(id, e => {
    e.className = style.classes.toolbar
    // div('(mouse)', e => {
    //   e.className = style.classes.toolbarItem
    //   e.style.border = 'none'
    //   e.style.borderBottom = '0.5px solid white'
    //   e.innerText = `Mouse: ${m.x}, ${m.y} (${m.clicks})`
    //   m.setSize(e.clientWidth)
    // })
    if (m.x > 100 && m.y > 100)
      div('pointer', e => {
        e.className = style.classes.pointer
        e.style.left = `${m.x}px`
        e.style.top = `${m.y}px`
        e.innerText = `(${m.x}, ${m.y})`
        m.setSize(e.clientWidth)
      })
    div('space', e => {
      e.className = style.classes.toolbarItem
      e.style.border = 'none'
      e.style.flexGrow = '1'
      e.style.textAlign = 'right'
      e.innerText = `Width: ${m.size}`
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
