// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { reactive } from '~/../source/reactronic-toolkit-react'
import { Application } from '~/app/Application'
import { AppWindow } from '~/view/AppWindow'

import { style } from './AppMain.css'

export function AppMain(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    return (
      <div className={css.main}>
        <AppWindow app={p.app}/>
      </div>
    )
  })
}
