// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { num, place, reactive, Viewport } from '@reactronic-toolkit-react'

import { AreaRect } from './AreaRect'
import { style } from './ViewportDebugger.css'

export function ViewportDebugger(p: {viewport: Viewport}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const v = p.viewport
    return (
      <div className={css.main}>
        <AreaRect hint={'All'} area={v.allCells} px={v.all} key={`all-${counter}`}
          className={css.all} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={v.surfaceCells} px={v.surface} inner={v.loaded} key={`surface-${counter}`}
            className={css.surface} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Loaded'} area={v.loadedCells} px={v.loaded} key={`buffer-${counter}`}
              className={css.buffer} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Visible'} area={v.visibleCells} px={v.visible} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={v.surfaceCells} px={v.surface} key={`canvas-${counter}`}
          className={css.surface} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(v.thumb.y, 1)} of {num(v.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(v.thumb.scaleBy(v.surfaceToVisibleFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(v.visible.scaleBy(v.allToSurfaceFactor).y, 15)}
            </div>
            <div>Resolution: {v.resolution.y} (font size)</div>
            <div>{num(v.all.size.y / v.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(v.surface.size.y)}</div>
            <div>{num(v.visibleToSurfaceFactor.y, 1)} <i>surface pixels in a single viewport pixel out of</i> {num(v.visible.size.y)}</div>
            <div>{num(v.visibleToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(v.visible.size.y)}</div>
            <div>{num(v.visibleToAllFactor.y / v.resolution.y, -3)} <i>cells in a single viewport pixel out of</i> {num(v.visible.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
