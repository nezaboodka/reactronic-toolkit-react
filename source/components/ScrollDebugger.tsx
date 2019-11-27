// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { TraceLevel } from 'reactronic'

import { area, num } from '../lib/Area'
import { VirtualGrid } from '../lib/VirtualGrid'
import { region } from '../tools/etc'
import { reactive } from '../tools/reactive'
import { AreaRect } from './AreaRect'
import { style } from './ScrollDebugger.css'

export function ScrollDebugger(p: {grid: VirtualGrid}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const g = p.grid
    const sf = g.surfaceArea
    const vp = g.viewportArea
    return (
      <div className={css.main}>
        <AreaRect hint={'All'} area={g.allCells} px={g.allArea} key={`all-${cycle}`}
          className={css.all} style={region(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={g.surfaceCells} px={sf} inner={g.readyArea} key={`surface-${cycle}`}
            className={css.surface} style={region(2, 2, 9, 9)}>
            <AreaRect hint={'Rendered'} area={g.readyCells} px={g.readyArea} key={`ready-${cycle}`}
              className={css.buffer} style={region(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={g.viewportCells} px={vp} key={`viewport-${cycle}`}
                className={css.viewport} style={region(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={g.surfaceCells} px={sf} key={`canvas-${cycle}`}
          className={css.surface} style={region(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(g.thumbY, 1)} of {num(sf.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(g.thumbY * g.surfaceToViewportRatio.y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(g.viewportSizeY * g.allToSurfaceRatio.y, 15)}
            </div>
            <div>Pixels per cell: {g.ppcY} (font size)</div>
            <div>{num(g.allArea.size.y / sf.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(sf.size.y)}</div>
            <div>{num(g.viewportToSurfaceRatio.y, 1)} <i>surface pixels in a single viewport pixel out of</i> {num(g.viewportSizeY)}</div>
            <div>{num(g.viewportToAllRatio.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(g.viewportSizeY)}</div>
            <div>{num(g.viewportToAllRatio.y / g.ppcY, -3)} <i>cells in a single viewport pixel out of</i> {num(g.viewportSizeY)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  }, {trace: TraceLevel.Suppress})
}
