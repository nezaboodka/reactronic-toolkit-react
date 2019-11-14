// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, VirtualDisplay, num } from '../../source/index'
import { place } from '../tools/common'
import { DataBuffer } from '../model/DataBuffer'
import { AreaRect } from './AreaRect'
import { style } from './AppDebugger.css'

export function AppDebugger(p: {display: VirtualDisplay, buffer: DataBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const d = p.display
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={d.allCells} px={d.all} key={`all-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={d.surfaceCells} px={d.surface} inner={d.loaded} key={`surface-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={d.bufferCells} px={d.buffer} key={`buffer-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Display'} area={d.viewportCells} px={d.viewport} key={`display-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={d.surfaceCells} px={d.surface} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(d.thumb.y, 1)} of {num(d.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(d.thumb.scaleBy(d.surfaceToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(d.viewport.scaleBy(d.allToSurfaceFactor).y, 15)}
            </div>
            <div>Font Size (resolution): {d.resolution}</div>
            <div>{num(d.all.size.y / d.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(d.surface.size.y)}</div>
            <div>{num(d.viewportToSurfaceFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(d.viewport.size.y)}</div>
            <div>{num(d.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(d.viewport.size.y)}</div>
            <div>{num(d.viewportToAllFactor.y / d.resolution, -3)} <i>cells in a single viewport pixel out of</i> {num(d.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
