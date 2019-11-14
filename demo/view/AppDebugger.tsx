// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { num, place, reactive, Telescope } from '@reactronic-toolkit-react'
import { DataBuffer } from '/m/DataBuffer'
import { AreaRect } from '/v/AreaRect'

import { style } from './AppDebugger.css'

export function AppDebugger(p: {telescope: Telescope, buffer: DataBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const t = p.telescope
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={t.allCells} px={t.all} key={`all-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={t.surfaceCells} px={t.surface} inner={t.loaded} key={`surface-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={t.bufferCells} px={t.buffer} key={`buffer-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Display'} area={t.viewportCells} px={t.viewport} key={`display-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={t.surfaceCells} px={t.surface} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
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
            <div>Font Size (resolution): {t.resolution}</div>
            <div>{num(t.all.size.y / t.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(t.surface.size.y)}</div>
            <div>{num(t.viewportToSurfaceFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <div>{num(t.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <div>{num(t.viewportToAllFactor.y / t.resolution, -3)} <i>cells in a single viewport pixel out of</i> {num(t.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
