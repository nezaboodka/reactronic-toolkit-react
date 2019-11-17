// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { num, place, reactive, VirtualScroll } from 'reactronic-toolkit-react'

import { AreaRect } from './AreaRect'
import { style } from './ViewportDebugger.css'

export function ViewportDebugger(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const scroll = p.scroll
    return (
      <div className={css.main}>
        <AreaRect hint={'All'} area={scroll.allCells} px={scroll.all} key={`all-${counter}`}
          className={css.all} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Surface'} area={scroll.surfaceCells} px={scroll.surface} inner={scroll.loaded} key={`surface-${counter}`}
            className={css.surface} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Loaded'} area={scroll.loadedCells} px={scroll.loaded} key={`buffer-${counter}`}
              className={css.buffer} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={scroll.viewportCells} px={scroll.viewport} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Surface'} area={scroll.surfaceCells} px={scroll.surface} key={`canvas-${counter}`}
          className={css.surface} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(scroll.thumb.y, 1)} of {num(scroll.surface.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(scroll.thumb.scaleBy(scroll.surfaceToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(scroll.viewport.scaleBy(scroll.allToSurfaceFactor).y, 15)}
            </div>
            <div>Resolution: {scroll.resolution.y} (font size)</div>
            <div>{num(scroll.all.size.y / scroll.surface.size.y, 1)} <i>all data pixels in a single surface pixel out of</i> {num(scroll.surface.size.y)}</div>
            <div>{num(scroll.viewportToSurfaceFactor.y, 1)} <i>surface pixels in a single viewport pixel out of</i> {num(scroll.viewport.size.y)}</div>
            <div>{num(scroll.viewportToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(scroll.viewport.size.y)}</div>
            <div>{num(scroll.viewportToAllFactor.y / scroll.resolution.y, -3)} <i>cells in a single viewport pixel out of</i> {num(scroll.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}
