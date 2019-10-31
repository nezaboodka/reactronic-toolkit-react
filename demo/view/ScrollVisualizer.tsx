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
        <AreaRect hint={'Database'} area={vs.gridCells} px={vs.grid} key={`grid-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Visual Component'} area={vs.componentCells} px={vs.component} key={`render-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Buffer'} area={vs.bufferCells} px={vs.buffer} outer={vs.component} key={`dataport-${counter}`}
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
          {vs.componentDevice ? (
            <div>
              <br/>
              <div>Scroll:
                x = {num(vs.componentDevice.scrollLeft)}/{num(vs.componentDevice.scrollWidth)},
                y = {num(vs.componentDevice.scrollTop)}/{num(vs.componentDevice.scrollHeight)},
                px = {num(Math.ceil(vs.componentDevice.scrollLeft / vs.componentPixelPerScrollPixel.x))},
                py = {num(Math.ceil(vs.componentDevice.scrollTop / vs.componentPixelPerScrollPixel.y))}
              </div>
              <div>Font Size: {vs.pixelsPerRow}</div>
              <div>{num(vs.componentPixelPerScrollPixel.y)} <i>device pixels in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
              <div>{num(vs.grid.size.y / vs.component.size.y)} <i>grid pixels in a single device pixel out of</i> {num(vs.component.size.y)}</div>
              <div>{num(vs.grid.size.y / vs.componentDevice.clientHeight)} <i>grid pixels in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
              <div>{num(vs.grid.size.y / vs.componentDevice.clientHeight / vs.pixelsPerRow)} <i>grid cells in a single scrollbar pixel out of</i> {num(vs.viewport.size.y)}</div>
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
  outer?: Area,
  className?: string,
  style?: React.CSSProperties,
  children?: JSX.Element}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    return (
      <div className={cx(css.area, p.className)} style={p.style}>
        {p.outer && (
          <div className={css.areaOuter} style={place(2, 2, 9, 2)}>
            <i>Gap: {num(p.px.y - p.outer.y)} px</i>
          </div>
        )}
        <div className={css.areaHint} style={place(2, 3, 9, 3)}>
          {p.hint}: {num(p.area.size.y, -3)} rows<br/>
          <i>↕ {num(p.px.size.y, 0)} px</i>
        </div>
        <div className={css.areaFrom} style={place(5, 3, 9, 3)}>
          {num(p.area.from.y, 3)}<br/>
          <i>{num(p.px.from.y, 0)} px</i>
        </div>
        <div className={css.areaTill} style={place(5, 9, 9, 9)}>
          <i>{num(p.px.till.y, 0)} px</i><br/>
          {num(p.area.till.y, 3)}
        </div>
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
