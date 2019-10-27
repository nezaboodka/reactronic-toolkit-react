// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../source/reactive'
import { place } from '../demo/common'
import { style } from './AppWindow.css'

export function AppWindow(p: {app: any}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    return (
      <div className={css.main}>
        <div className={css.scroll} style={place(2, 2, 9, 9)}>
          <div className={css.content}>
            coming soon...
          </div>
        </div>
      </div>
    )
  })
}
