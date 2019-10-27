// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/reactive'
import { place } from '../common'
import { Area } from '../../source/Area'
import { VirtualScroll, num } from '../../source/VirtualScroll'
import { style } from './VirtualScrollVisualizer.css'

export function VirtualScrollVisualizer(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vs = p.scroll
    return (
      <div className={css.main}>
        <AreaRect area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.grid} style={place(1, 1, 10, 10)}>
          <AreaRect area={vs.dataport} px={vs.pxDataport} key={`dataport-${counter}`}
            className={css.dataport} style={place(2, 2, 9, 9)}>
            <AreaRect area={vs.viewport} px={vs.pxViewport} key={`viewport-${counter}`}
              className={css.viewport} style={place(3, 3, 8, 8)}>
              <div style={{height: '10em'}}></div>
            </AreaRect>
          </AreaRect>
        </AreaRect>
      </div>
    )
  })
}

function AreaRect(p: {
  area: Area,
  px: Area,
  className?: string,
  style?: React.CSSProperties,
  children?: JSX.Element}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    return (
      <div className={css.area + (p.className ? ` ${p.className}` : '')} style={p.style}>
        <div className={css.areaTop} style={place(3, 2, 8, 2)}>
          x:{num(p.area.from.x)}&nbsp;&nbsp;&nbsp;y:{num(p.area.from.y)}<br/>
          <span style={{opacity: 0.3}}>x: {num(p.px.from.x)}&nbsp;&nbsp;&nbsp;y: {num(p.px.from.y)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(px)</span>
        </div>
        <div className={css.areaBottom} style={place(2, 9, 9, 9)}>
          <span style={{opacity: 0.3}}>(px)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x: {num(p.px.till.x)}&nbsp;&nbsp;&nbsp;y: {num(p.px.till.y)}</span><br/>
          x:{num(p.area.till.x)}&nbsp;&nbsp;&nbsp;y:{num(p.area.till.y)}
        </div>
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
