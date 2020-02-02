// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { flush, Key, reactive } from './api'
import { div, i, t } from './html'

export function Toolbar(key: Key, className: string): void {
  div(key, e => {
    e.className = className
    ToolbarButton('menu', 'las la-menu', 'Menu')
    div('spring', e => e.style.flexGrow = '1')
    ToolbarButton('settings', 'las la-cog', 'Settings')
    ToolbarButton('close', 'las la-times', 'Close')
  })
}

export function ToolbarButton(key: Key, icon: string, text: string): void {
  reactive(key, () => {

    let measure: HTMLDivElement
    div(key, e => {
      e.className = 'fancy-button'

      div('icon', e => {
        e.className = 'fancy-button-icon'
        i('sym', el => el.className = icon)
      })

      div('text', e => {
        e.className = 'fancy-button-text'
        t(text)
        measure = e
      })
    })

    flush() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log(measure!.clientWidth)
  })
}
