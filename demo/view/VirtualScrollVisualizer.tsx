// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/reactive'
import { place } from '../common'
import { Area, XY } from '../../source/Area'
import { VirtualScroll, num } from '../../source/VirtualScroll'
import { style } from './VirtualScrollVisualizer.css'
import { cx } from 'emotion'

export function VirtualScrollVisualizer(p: {scroll: VirtualScroll}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const vs = p.scroll
    return (
      <div className={css.main}>
        <AreaRect hint={'Device'} px={vs.device} key={`device-${counter}`}
          className={css.device} style={place(1, 10, 10, 10)}>
          <div style={{height: '3em'}}></div>
        </AreaRect>
        <AreaRect hint={'All Grid'} area={vs.grid} px={vs.pxGrid} key={`grid-${counter}`}
          className={css.grid} style={place(1, 1, 10, 9)}>
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
  area?: Area,
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
          {p.area && (
            <div>
              <i> cells </i><Coords coords={p.area.size} delimiter={'x'}/>
            </div>
          )}
        </div>
        <div className={css.areaFrom} style={place(2, 2, 6, 2)}>
          {p.area && (
            <React.Fragment>
              <Coords coords={p.area.from}/>
              <i> cell </i>
              <br/>
            </React.Fragment>
          )}
          <Coords coords={p.px.from} className={css.px}/>
          <i> px </i>
        </div>
        <div className={css.areaTill} style={place(2, 9, 9, 9)}>
          <i> px </i>
          <Coords coords={p.px.till} className={css.px}/>
          {p.area && (
            <React.Fragment>
              <br/>
              <i> cell </i>
              <Coords coords={p.area.till}/>
            </React.Fragment>
          )}
        </div>
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  })
}

function Coords(p: {coords: XY, delimiter?: string, className?: string, style?: React.CSSProperties}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    return (
      <div className={cx(css.coords, p.className)} style={p.style}>
        {num(p.coords.x)}<i> {p.delimiter || ','} </i>{num(p.coords.y)}
      </div>
    )
  })
}
