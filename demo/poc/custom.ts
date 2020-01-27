// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Node } from './api'
import { div, i, text } from './html'

export interface FancyButtonModel {
  className?: string
  style?: any
}

export function FancyButton(model: FancyButtonModel): Node<FancyButtonModel, HTMLDivElement> {
  // return { type, key: undefined, model, view: undefined, children }
  return render(
    div(x => {
      x.className = 'fancy-button'
      div(x => {
        x.className = 'fancy-button-icon'
        i(x => {
          x.className = 'la las-times'
        })
      })
      div(x => {
        x.className = 'fancy-button-text'
        text('press here')
      })
    })
  )
}

function render(node: any): any {
  //
}
