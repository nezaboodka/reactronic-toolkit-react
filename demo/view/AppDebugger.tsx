// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, VirtualProjector, num } from '../../source/index'
import { place } from '../tools/common'
import { DataBuffer } from '../model/DataBuffer'
import { AreaRect } from './AreaRect'
import { style } from './AppDebugger.css'

export function AppDebugger(p: {projector: VirtualProjector, buffer: DataBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vp = p.projector
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={vp.allCells} px={vp.all} key={`all-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={vp.surfaceCells} px={vp.surface} inner={vp.loaded} key={`surface-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={vp.bufferCells} px={vp.buffer} key={`buffer-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Display'} area={vp.viewportCells} px={vp.viewport} key={`display-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={vp.surfaceCells} px={vp.surface} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(vp.thumb.y, 1)} of {num(vp.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(vp.thumb.scaleBy(vp.surfaceToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(vp.viewport.scaleBy(vp.allToSurfaceFactor).y, 15)}
            </div>
            <div>Font Size (resolution): {vp.resolution}</div>
            <div>{num(vp.all.size.y / vp.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(vp.surface.size.y)}</div>
            <div>{num(vp.viewportToSurfaceFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(vp.viewport.size.y)}</div>
            <div>{num(vp.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(vp.viewport.size.y)}</div>
            <div>{num(vp.viewportToAllFactor.y / vp.resolution, -3)} <i>cells in a single viewport pixel out of</i> {num(vp.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
