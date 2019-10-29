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
        <AreaRect hint={'Database'} area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.database} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Visual Component'} area={vs.componentArea} px={vs.pxComponentArea} key={`render-${counter}`}
            className={css.component} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Fetched Data'} area={vs.dataArea} px={vs.pxDataArea} key={`dataport-${counter}`}
              className={css.dataArea} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'Viewport'} area={vs.viewport} px={vs.pxViewport} key={`viewport-${counter}`}
                className={css.viewport} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
        </AreaRect>
        <AreaRect hint={'Device'} area={vs.componentArea} px={vs.pxComponentArea} key={`device-${counter}`}
          className={css.component} style={place(1, 10, 10, 10)}>
          {vs.component ? (
            <div>
              <br/>
              <div>Scroll:
                x = {num(vs.component.scrollLeft)},
                y = {num(vs.component.scrollTop)},
                px = {num(vs.component.scrollLeft / vs.componentPxPerScrollPx.x, 3)},
                py = {num(vs.component.scrollTop / vs.componentPxPerScrollPx.y, 3)}
              </div>
              <div>Font Size: {vs.pxPerRow}</div>
              <div>{num(vs.componentPxPerScrollPx.y)} <i>device pixels in a single scrollbar pixel out of</i> {num(vs.pxViewport.size.y)}</div>
              <div>{num(vs.pxGrid.size.y / vs.pxComponentArea.size.y)} <i>grid pixels in a single device pixel out of</i> {num(vs.pxComponentArea.size.y)}</div>
              <div>{num(vs.pxGrid.size.y / vs.component.clientHeight)} <i>grid pixels in a single scrollbar pixel out of</i> {num(vs.pxViewport.size.y)}</div>
              <div>{num(vs.pxGrid.size.y / vs.component.clientHeight / vs.pxPerRow)} <i>grid cells in a single scrollbar pixel out of</i> {num(vs.pxViewport.size.y)}</div>
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
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
