// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'

import { setFrame } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'
import { style } from '~/view/GridFragment.css'
import { div } from '~/viewtronic/html'

export function GridFragment(loader: GridFragmentLoader, className?: string): void {
  const css = style.css
  const area = loader.readyArea
  const html = loader.html(cx(css.cell, css.rollout))
  div('fragment', e => {
    e.className = cx(className)
    setFrame(e, area.size.x, area.size.y, area.x, area.y)
    e.innerHTML = html
  })
  // }, {hint: `<${GridFragment.name}>`})
}
