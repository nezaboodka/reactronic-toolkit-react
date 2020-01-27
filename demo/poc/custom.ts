// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Node } from './api'
import { div, i } from './html'

export interface FancyButtonModel {
  className?: string
  style?: any
}

export function FancyButton(model: FancyButtonModel): Node<FancyButtonModel, HTMLDivElement> {
  // return { type, key: undefined, model, view: undefined, children }
  const condition = false
  return render(
    div('fancy-button', () => [
      div('fancy-button-icon', () => [
        i('la las-times')
      ]),
      div('fancy-button-text', () => (
        'press here'
      )),
    ])
  )
}

function render(node: any): any {
  //
}
