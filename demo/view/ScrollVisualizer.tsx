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
        <AreaRect hint={'All Data'} area={vs.allCells} px={vs.all} key={`grid-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Scroll Box'} area={vs.componentCells} px={vs.component} inner={vs.buffer} key={`render-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Data Buffer'} area={vs.bufferCells} px={vs.buffer} key={`dataport-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={vs.viewportCells} px={vs.viewport} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Device'} area={vs.componentCells} px={vs.component} key={`device-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          {vs.device ? (
            <div>
              <br/>
              <div>Scroll:
                x = {num(vs.device.scrollLeft)}/{num(vs.device.scrollWidth)},
                y = {num(vs.device.scrollTop)}/{num(vs.device.scrollHeight)},
                px = {num(Math.ceil(vs.device.scrollLeft / vs.componentPixelPerScrollPixel.x))},
                py = {num(Math.ceil(vs.device.scrollTop / vs.componentPixelPerScrollPixel.y))}
              </div>
              <div>Font Size: {vs.pixelsPerCell}</div>
              <div>{num(vs.componentPixelPerScrollPixel.y)} <i>device pixels in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
              <div>{num(vs.all.size.y / vs.component.size.y)} <i>grid pixels in a single device pixel out of</i> {num(vs.component.size.y)}</div>
              <div>{num(vs.all.size.y / vs.device.clientHeight)} <i>grid pixels in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
              <div>{num(vs.all.size.y / vs.device.clientHeight / vs.pixelsPerCell)} <i>grid cells in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
              <br/>
            </div>
          ) : <div/>}
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
          <i>↕ {num(p.px.size.y, 0)} px</i>
        </div>
        <div className={css.areaFrom} style={place(5, 2, 9, 2)}>
          {num(p.area.from.y, 3)}<br/>
          <i>{num(p.px.from.y, 0)} px</i>
        </div>
        <div className={css.areaTill} style={place(5, 9, 9, 9)}>
          <i>{num(p.px.till.y, 0)} px</i><br/>
          {num(p.area.till.y, 3)}
        </div>
        {p.inner && (
          <div className={css.areaOuter} style={place(2, 3, 9, 3)}>
            <i>Gap: {num(p.inner.y - p.px.y)} px</i>
          </div>
        )}
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
