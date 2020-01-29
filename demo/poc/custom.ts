// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Node } from './api'
import { div, i, t } from './html'

export interface FancyButtonModel {
  className?: string
  style?: any
}

export function FancyButton(model: FancyButtonModel): Node<void, HTMLDivElement> {
  // return { type, key: undefined, model, view: undefined, children }
  return render(
    div(e => {
      e.className = 'fancy-button'

      div(e => {
        e.className = 'fancy-button-icon'
        i(el => {
          el.className = 'la las-times'
        })
      })

      div(e => {
        e.className = 'fancy-button-text'
        t('press here')
      })
    })
  )
}

export function render(node: any): any {
  //
}
