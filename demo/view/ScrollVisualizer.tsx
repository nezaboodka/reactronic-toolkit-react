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
        <AreaRect hint={'Device'} area={vs.deviceArea} px={vs.pxDeviceArea} key={`device-${counter}`}
          className={css.device} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            {vs.component && <div>{num(vs.pxDeviceArea.size.y / vs.component.clientHeight)} <i>render pixels in a single scrollbar pixel out of</i> {num(vs.component.clientHeight)}</div>}
            <div>{num(vs.pxGrid.size.y / vs.pxDeviceArea.size.y)} <i>grid pixels in a single render pixel out of</i> {num(vs.pxDeviceArea.size.y)}</div>
            {vs.component && <div>{num(vs.pxGrid.size.y / vs.component.clientHeight)} <i>grid pixels in a single scrollbar pixel out of</i> {num(vs.component.clientHeight)}</div>}
            {vs.component && <div>{num(vs.pxGrid.size.y / vs.component.clientHeight / vs.pxPerCell)} <i>grid cells in a single scrollbar pixel out of</i> {num(vs.component.clientHeight)}</div>}
            <br/>
          </div>
        </AreaRect>
        <AreaRect hint={'Grid Area'} area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.grid} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Device Area'} area={vs.deviceArea} px={vs.pxDeviceArea} key={`render-${counter}`}
            className={css.device} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Data Area'} area={vs.dataArea()} px={vs.pxDataArea} key={`dataport-${counter}`}
              className={css.data} style={place(2, 2, 9, 9)}>
              <AreaRect hint={'View Area'} area={vs.viewArea} px={vs.pxViewArea} key={`viewport-${counter}`}
                className={css.view} style={place(3, 3, 8, 8)}>
                <div style={{height: '1em'}}></div>
              </AreaRect>
            </AreaRect>
          </AreaRect>
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
