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
    const vp = p.viewport
    return (
      <div className={css.main}>
        <AreaRect hint={'All'} area={vp.allCells} px={vp.all} key={`all-${counter}`}
          className={css.all} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={vp.surfaceCells} px={vp.surface} inner={vp.loaded} key={`surface-${counter}`}
            className={css.surface} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Loaded'} area={vp.loadedCells} px={vp.loaded} key={`buffer-${counter}`}
              className={css.buffer} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Visible'} area={vp.windowCells} px={vp.window} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={vp.surfaceCells} px={vp.surface} key={`canvas-${counter}`}
          className={css.surface} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(vp.thumb.y, 1)} of {num(vp.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(vp.thumb.scaleBy(vp.surfaceToWindowFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(vp.window.scaleBy(vp.allToSurfaceFactor).y, 15)}
            </div>
            <div>Resolution: {vp.resolution.y} (font size)</div>
            <div>{num(vp.all.size.y / vp.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(vp.surface.size.y)}</div>
            <div>{num(vp.windowToSurfaceFactor.y, 1)} <i>surface pixels in a single viewport pixel out of</i> {num(vp.window.size.y)}</div>
            <div>{num(vp.windowToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(vp.window.size.y)}</div>
            <div>{num(vp.windowToAllFactor.y / vp.resolution.y, -3)} <i>cells in a single viewport pixel out of</i> {num(vp.window.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
