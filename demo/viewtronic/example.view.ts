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
    const cn = style.css
    e.className = cn.app
    e.onclick = event => m.click()
    e.onmousemove = event => m.move(event.x, event.y)
    Toolbar('toolbar', m)
  })
}

export function Toolbar(id: string, m: Model): void {
  div(id, e => {
    const cn = style.css
    e.className = cn.toolbar
    if (m.x > 100 && m.y > 100)
      div('pointer', e => {
        e.className = cn.pointer
        e.style.left = `${m.x}px`
        e.style.top = `${m.y}px`
        e.innerText = `(${m.x}, ${m.y})`
        m.setSize(e.clientWidth)
      })
    div('space', e => {
      e.className = cn.toolbarItem
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
    const cn = style.css
    e.className = cn.toolbarItem
    div('icon', e => e.className = cx(icon, style.css.toolbarIcon))
    div('text', e => {
      e.className = cn.toolbarText
      e.innerText = `${id}`
    })
  })
}
