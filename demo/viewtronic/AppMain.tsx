// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Application } from '~/app/Application'
import { style } from '~/view/AppMain.css'
import { AppWindow } from '~/viewtronic/AppWindow'
import { div } from '~/viewtronic/html'

export function AppMain(id: string, app: Application): void {
  div(id, e => {
    const css = style.css
    e.className = css.main
    AppWindow(AppWindow.name, app)
  })
}
