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
import { cx } from 'emotion'

export function VirtualScrollVisualizer(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vs = p.scroll
    return (
      <div className={css.main}>
        <AreaRect hint={'All Grid'} area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.grid} style={place(1, 1, 10, 10)}>
          <AreaRect hint={'Dataport'} area={vs.dataport} px={vs.pxDataport} key={`dataport-${counter}`}
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
  return reactive(() => {
    const css = style.classes
    return (
      <div className={css.area + (p.className ? ` ${p.className}` : '')} style={p.style}>
        <div className={css.areaHint} style={place(6, 2, 9, 2)}>
          <div>{p.hint}</div>
          <div>
            {num(p.area.size.x)} <i>x</i> {num(p.area.size.y)} <i>cells</i>
          </div>
        </div>
        <div className={css.areaTop} style={place(2, 2, 6, 2)}>
          <div className={css.coords}>
            {num(p.area.from.x)} <i>x</i><br/>
            {num(p.area.from.y)} <i>y</i><br/>
          </div>
          <div className={cx(css.coords, css.px)}>
            {num(p.px.from.x)} <i>px</i><br/>
            {num(p.px.from.y)} <i>px</i><br/>
          </div>
        </div>
        <div className={css.areaBottom} style={place(2, 9, 9, 9)}>
          <div className={cx(css.coords, css.px)}>
            {num(p.px.till.x)} <i>px</i><br/>
            {num(p.px.till.y)} <i>px</i><br/>
          </div>
          <div className={css.coords}>
            {num(p.area.till.x)} <i>x</i><br/>
            {num(p.area.till.y)} <i>y</i><br/>
          </div>
        </div>
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}
