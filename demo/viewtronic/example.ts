// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { div, i } from '~/viewtronic/html'

// import { reactive, renderChildren } from './api'

export function Toolbar(id: string, className: string): void {
  div(id, e => {
    e.className = className
    e.style.zIndex = '100'
    e.style.display = 'flex'
    e.style.flexDirection = 'row'
    ToolbarButton('menu', 'las la-menu', 'Menu')
    div('spring', e => e.style.flexGrow = '1')
    ToolbarButton('settings', 'las la-cog', 'Settings')
    ToolbarButton('close', 'las la-times', 'Close')
  })
  // Same in TSX:
  // <div id={id} className={className}>
  //   <ToolbarButton id="menu" icon="las la-menu" caption="Menu"/>
  //   <div id="spring" style={{flexGrow: 1}}/>
  //   <ToolbarButton id="settings" icon="las la-cog" caption="Settings"/>
  //   <ToolbarButton id="close" icon="las la-times" caption="Close"/>
  //   ...
  // </div>
}

export function ToolbarButton(id: string, icon: string, caption?: string): void {
  // reactive(id, () => {

  // let measure: HTMLDivElement
  div(id, e => {
    e.className = 'fancy-button'

    div('icon', e => {
      e.className = 'fancy-button-icon'
      i('sym', el => el.className = icon)
    })

    div('text', e => {
      e.className = 'fancy-button-text'
      e.innerText = caption || ''
      // measure = e
    })
  })

  // renderChildren() // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // console.log(`measured: ${measure!.clientHeight}`)

  // })
}
