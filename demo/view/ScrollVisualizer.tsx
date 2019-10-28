// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, Area, VirtualScroll, num } from '../../source/index'
import { place } from '../common'
import { style } from './ScrollVisualizer.css'

export function ScrollVisualizer(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vs = p.scroll
    return (
      <div className={css.main}>
        <AreaRect hint={'Device'} area={vs.pxDevice} px={vs.pxDevice} key={`device-${counter}`}
          className={css.device} style={place(1, 10, 10, 10)}>
          <div>
            <br/>
            {vs.device && <div>{num(vs.pxDevice.size.y / vs.device.clientHeight)} <i>device pixels in a single scrollbar pixel out of</i> {num(vs.device.clientHeight)}</div>}
            <div>{num(vs.pxGrid.size.y / vs.pxDevice.size.y)} <i>grid pixels in a single device pixel out of</i> {num(vs.pxDevice.size.y)}</div>
            {vs.device && <div>{num(vs.pxGrid.size.y / vs.device.clientHeight)} <i>grid pixels in a single scrollbar pixel out of</i> {num(vs.device.clientHeight)}</div>}
            {vs.device && <div>{num(vs.pxGrid.size.y / vs.device.clientHeight / vs.pxPerCell)} <i>grid cells in a single scrollbar pixel out of</i> {num(vs.device.clientHeight)}</div>}
            <br/>
          </div>
        </AreaRect>
        <AreaRect hint={'All Grid'} area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.grid} style={place(1, 1, 10, 9)}>
          <AreaRect hint={'Dataport'} area={vs.dataport()} px={vs.pxDataport} key={`dataport-${counter}`}
            className={css.dataport} style={place(2, 2, 9, 9)}>
            <AreaRect hint={'Viewport'} area={vs.viewport} px={vs.pxViewport} key={`viewport-${counter}`}
              className={css.viewport} style={place(3, 3, 8, 8)}>
              <div style={{height: '5em'}}></div>
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
      <div className={css.area + (p.className ? ` ${p.className}` : '')} style={p.style}>
        <div className={css.areaHint} style={place(2, 2, 9, 2)}>
          {p.hint}
        </div>
        <div className={css.areaFrom} style={place(2, 2, 6, 2)}>
          <div><i>x:</i> {num(p.area.from.x)} <i> / {num(p.px.from.x)} px</i></div>
          <div><i>y:</i> {num(p.area.from.y)} <i> / {num(p.px.from.y)} px</i></div>
        </div>
        <div className={css.areaRight} style={place(2, 2, 9, 2)}>
          <div><i>{num(p.px.till.x)} px / x: </i> {num(p.area.till.x)}</div>
        </div>
        <div className={css.areaBottom} style={place(2, 9, 9, 9)}>
          <div><i>y:</i> {num(p.area.till.y)} <i> / {num(p.px.till.y)} px</i></div>
        </div>
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
