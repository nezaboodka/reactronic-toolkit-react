// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { flush, reactive } from './api'
import { div, i, t } from './html'

export function Toolbar(id: string, className: string): void {
  div(id, e => {
    e.className = className
    ToolbarButton('menu', 'las la-menu', 'Menu')
    div('spring', e => e.style.flexGrow = '1')
    ToolbarButton('settings', 'las la-cog', 'Settings')
    ToolbarButton('close', 'las la-times', 'Close')
  })
}

export function ToolbarButton(id: string, icon: string, text?: string): void {
  reactive(id, () => {

    let measure: HTMLDivElement
    div(id, e => {
      e.className = 'fancy-button'

      div('icon', e => {
        e.className = 'fancy-button-icon'
        i('sym', el => el.className = icon)
      })

      div('text', e => {
        e.className = 'fancy-button-text'
        t(text || id)
        measure = e
      })
    })

    flush() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log(measure!.clientWidth)
  })
}
