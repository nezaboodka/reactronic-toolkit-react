// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { num, place, reactive, VirtualGrid } from '@reactronic-toolkit-react'
import { DataBuffer } from '/m/DataBuffer'
import { AreaRect } from '/v/AreaRect'

import { style } from './AppDebugger.css'

export function AppDebugger(p: {grid: VirtualGrid, buffer: DataBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const g = p.grid
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={g.allCells} px={g.all} key={`all-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={g.surfaceCells} px={g.surface} inner={g.loaded} key={`surface-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={g.bufferCells} px={g.buffer} key={`buffer-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Display'} area={g.viewportCells} px={g.viewport} key={`display-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={g.surfaceCells} px={g.surface} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(g.thumb.y, 1)} of {num(g.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(g.thumb.scaleBy(g.surfaceToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(g.viewport.scaleBy(g.allToSurfaceFactor).y, 15)}
            </div>
            <div>Font Size (resolution): {g.resolution}</div>
            <div>{num(g.all.size.y / g.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(g.surface.size.y)}</div>
            <div>{num(g.viewportToSurfaceFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(g.viewport.size.y)}</div>
            <div>{num(g.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(g.viewport.size.y)}</div>
            <div>{num(g.viewportToAllFactor.y / g.resolution, -3)} <i>cells in a single viewport pixel out of</i> {num(g.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
