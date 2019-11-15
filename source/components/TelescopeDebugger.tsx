// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { GridTelescope, num, place, reactive } from '@reactronic-toolkit-react'

import { AreaRect } from './AreaRect'
import { style } from './TelescopeDebugger.css'

export function TelescopeDebugger(p: {telescope: GridTelescope}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const t = p.telescope
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={t.allCells} px={t.all} key={`all-${counter}`}
          className={css.all} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={t.surfaceCells} px={t.surface} inner={t.loaded} key={`surface-${counter}`}
            className={css.surface} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={t.bufferCells} px={t.buffer} key={`buffer-${counter}`}
              className={css.buffer} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={t.viewportCells} px={t.viewport} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={t.surfaceCells} px={t.surface} key={`canvas-${counter}`}
          className={css.surface} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(t.thumb.y, 1)} of {num(t.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(t.thumb.scaleBy(t.surfaceToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(t.viewport.scaleBy(t.allToSurfaceFactor).y, 15)}
            </div>
            <div>Resolution: {t.resolution.y} (font size)</div>
            <div>{num(t.all.size.y / t.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(t.surface.size.y)}</div>
            <div>{num(t.viewportToSurfaceFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <div>{num(t.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <div>{num(t.viewportToAllFactor.y / t.resolution.y, -3)} <i>cells in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
