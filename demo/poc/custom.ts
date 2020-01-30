// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { flush, Key, reactive } from './api'
import { div, i, t } from './html'

export function Toolbar(className: string, k?: Key): void {
  div(e => {
    e.className = className
    FancyButton(0, 'las la-menu', 'Menu')
    div(e => e.style.flexGrow = '1')
    FancyButton(0, 'las la-cog', 'Settings')
    FancyButton(0, 'las la-times', 'Close')
  }, k)
}

export function FancyButton(k: Key, icon: string, text: string): void {
  reactive(k, () => {
    let textElem: HTMLDivElement

    div(e => {
      e.className = 'fancy-button'

      div(e => {
        e.className = 'fancy-button-icon'
        i(el => el.className = icon)
      })

      div(e => {
        textElem = e
        e.className = 'fancy-button-text'
        t(text)
      })
    })

    flush() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log(textElem!.clientWidth)
  })
}
