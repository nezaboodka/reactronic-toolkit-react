// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { flush, Key, reactive } from './api'
import { div, i, t } from './html'

export function Toolbar(className: string, k?: Key): void {
  div(e => {
    e.className = className
    ToolbarButton('las la-menu', 'Menu')
    div(e => e.style.flexGrow = '1')
    ToolbarButton('las la-cog', 'Settings')
    ToolbarButton('las la-times', 'Close')
  }, k)
}

export function ToolbarButton(icon: string, text: string, k?: Key): void {
  reactive(k, () => {

    let measure: HTMLDivElement
    div(e => {
      e.className = 'fancy-button'

      div(e => {
        e.className = 'fancy-button-icon'
        i(el => el.className = icon)
      })

      div(e => {
        e.className = 'fancy-button-text'
        t(text)
        measure = e
      })
    })

    flush() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log(measure!.clientWidth)
  })
}
