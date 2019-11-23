// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { TraceLevel } from 'reactronic'

import { num } from '../lib/Area'
import { VirtualGrid } from '../lib/VirtualGrid'
import { place } from '../tools/etc'
import { reactive } from '../tools/reactive'
import { AreaRect } from './AreaRect'
import { style } from './ScrollDebugger.css'

export function ScrollDebugger(p: {grid: VirtualGrid}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const g = p.grid
    return (
      <div className={css.main}>
        <AreaRect hint={'All'} area={g.allCells} px={g.allArea} key={`all-${cycle}`}
          className={css.all} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={g.surfaceCells} px={g.surfaceArea} inner={g.readyArea} key={`surface-${cycle}`}
            className={css.surface} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Rendered'} area={g.readyCells} px={g.readyArea} key={`ready-${cycle}`}
              className={css.buffer} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={g.viewportCells} px={g.viewportArea} key={`viewport-${cycle}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={g.surfaceCells} px={g.surfaceArea} key={`canvas-${cycle}`}
          className={css.surface} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(g.thumb.y, 1)} of {num(g.surfaceArea.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(g.thumb.scaleBy(g.surfaceToViewportRatio).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(g.viewportArea.scaleBy(g.allToSurfaceRatio).y, 15)}
            </div>
            <div>Pixels per cell: {g.ppc.y} (font size)</div>
            <div>{num(g.allArea.size.y / g.surfaceArea.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(g.surfaceArea.size.y)}</div>
            <div>{num(g.viewportToSurfaceRatio.y, 1)} <i>surface pixels in a single viewport pixel out of</i> {num(g.viewportArea.size.y)}</div>
            <div>{num(g.viewportToAllRatio.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(g.viewportArea.size.y)}</div>
            <div>{num(g.viewportToAllRatio.y / g.ppc.y, -3)} <i>cells in a single viewport pixel out of</i> {num(g.viewportArea.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  }, undefined, TraceLevel.Suppress)
}
