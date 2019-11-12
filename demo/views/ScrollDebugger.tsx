// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { TraceLevel } from 'reactronic'
import { reactive, Area, Viewport, num } from '../../source/index'
import { place } from '../tools/common'
import { cx } from 'emotion'
import { DataBuffer } from '../models/DataBuffer'
import { style } from './ScrollDebugger.css'

export function ScrollDebugger(p: {viewport: Viewport, buffer: DataBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vp = p.viewport
    return (
      <div className={css.main}>
        <AreaRect hint={'All Data'} area={vp.grid} px={vp.all} key={`grid-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Canvas'} area={vp.canvasCells} px={vp.canvas} inner={vp.buffer} key={`render-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={vp.bufferCells} px={vp.buffer} key={`dataport-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'View'} area={vp.viewCells} px={vp.view} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Canvas'} area={vp.canvasCells} px={vp.canvas} key={`canvas-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            <div>
              Thumb: {num(vp.canvasThumb.y, 1)} of {num(vp.canvas.size.y, 1)} canvas pixels,
            </div>
            <div>
              Thumb Pixel = {num(vp.canvasThumb.scaleBy(vp.canvasToViewFactor).y, 3)}
            </div>
            <div>
              Viewport-to-Canvas = {num(vp.view.scaleBy(vp.allToCanvasFactor).y, 15)}
            </div>
            <div>Font Size: {vp.pixelsPerCell}</div>
            <div>{num(vp.all.size.y / vp.canvas.size.y, 1)} <i>all data pixels in a single canvas pixel out of</i> {num(vp.canvas.size.y)}</div>
            <div>{num(vp.viewToCanvasFactor.y, 1)} <i>canvas pixels in a single viewport pixel out of</i> {num(vp.view.size.y)}</div>
            <div>{num(vp.viewToAllFactor.y, 1)} <i>all data pixels in a single viewport pixel out of</i> {num(vp.view.size.y)}</div>
            <div>{num(vp.viewToAllFactor.y / vp.pixelsPerCell, -3)} <i>cells in a single viewport pixel out of</i> {num(vp.view.size.y)}</div>
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
  }, TraceLevel.Suppress)
}
