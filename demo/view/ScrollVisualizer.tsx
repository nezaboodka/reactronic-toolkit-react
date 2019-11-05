// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { cx } from 'emotion'
import { reactive, Area, VirtualScroll, num } from '../../source/index'
import { place } from '../common'
import { style } from './ScrollVisualizer.css'

export function ScrollVisualizer(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vs = p.scroll
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={vs.grid} px={vs.global} key={`grid-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Canvas'} area={vs.canvasCells} px={vs.canvas} inner={vs.buffer} key={`render-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={vs.bufferCells} px={vs.buffer} key={`dataport-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={vs.viewportCells} px={vs.viewport} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Canvas'} area={vs.canvasCells} px={vs.canvas} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(vs.canvasThumb.y, 1)} of {num(vs.canvas.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(vs.canvasThumb.scaleBy(vs.canvasToViewportFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(vs.viewport.scaleBy(vs.globalToCanvasFactor).y, 15)}
            </div>
            <div>Font Size: {vs.pixelsPerCell}</div>
            <div>{num(vs.global.size.y / vs.canvas.size.y, 1)} <i>all data pixels in a single canvas pixel out of</i> {num(vs.canvas.size.y)}</div>
            <div>{num(vs.viewportToCanvasFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(vs.viewport.size.y)}</div>
            <div>{num(vs.viewportToGlobalFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(vs.viewport.size.y)}</div>
            <div>{num(vs.viewportToGlobalFactor.y / vs.pixelsPerCell, -3)} <i>cells in a single viewport pixel out of</i> {num(vs.viewport.size.y)}</div>
            <br/>
          </div>
        </AreaRect>
      </div>
    )
  })
}

function AreaRect(p: {
  hint: string,
  area: Area,
  px: Area,
  inner?: Area,
  className?: string,
  style?: React.CSSProperties,
  children?: JSX.Element}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    return (
      <div className={cx(css.area, p.className)} style={p.style}>
        <div className={css.areaHint} style={place(2, 2, 9, 2)}>
          {p.hint}: {num(p.area.size.y, -3)} rows<br/>
          <i>↕ {num(p.px.size.y, 1)} px</i>
        </div>
        <div className={css.areaFrom} style={place(5, 2, 9, 2)}>
          {num(p.area.from.y, 3)}<br/>
          <i>{num(p.px.from.y, 1)} px</i>
        </div>
        <div className={css.areaTill} style={place(5, 9, 9, 9)}>
          <i>{num(p.px.till.y, 1)} px</i><br/>
          {num(p.area.till.y, 3)}
        </div>
        {p.inner && (
          <div className={css.areaOuter} style={place(2, 3, 9, 3)}>
            <i>Gap: {num(p.inner.y - p.px.y, 1)} px</i>
          </div>
        )}
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
