// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, spot } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'

import { style } from './GridFragment.css'

export function GridFragment(p: {
  loader: GridFragmentLoader,
  className?: string}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const area = p.loader.area
    const html = p.loader.html(cx(css.cell, css.blink1))
    return (
      <div className={cx(p.className)}
        style={spot(area.size.x, area.size.y, area.x, area.y)}
        dangerouslySetInnerHTML={{__html: html}}>
      </div>
    )
  }, `<${GridFragment.name}>`)
}
