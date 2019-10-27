// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/reactive'
import { place } from '../common'
import { style } from './AppWindow.css'
import { xy } from '../../source/Area'
import { VirtualScroll, num, dumpArea } from '../../source/VirtualScroll'
import { VirtualScrollVisualizer } from './VirtualScrollVisualizer'

export function AppWindow(p: {app: VirtualScroll}): JSX.Element {
  const ref = React.useCallback(element => p.app.setDevice(element), [])
  return reactive(() => {
    const css = style.classes
    const items: string[] = []
    for (let i = 0; i < p.app.grid.size.y; i++)
      items.push(`[${i}]`)
    return (
      <div className={css.window}>
        <div ref={ref} onScroll={e => p.app.scrollTo(xy(e.currentTarget.scrollLeft, e.currentTarget.scrollTop))}
          className={css.scroll} style={place(2, 2, 9, 9)}>
          <div className={css.content}>
            {items.map((s, i) => <div>{s}</div>)}
          </div>
        </div>
        <div className={css.info} style={place(10, 2, 10, 3)}>
          <Info app={p.app}/>
        </div>
        <div className={css.info} style={place(10, 8, 10, 9)}>
          <VirtualScrollVisualizer scroll={p.app}/>
        </div>
      </div>
    )
  })
}

function Info(p: {app: VirtualScroll}): JSX.Element {
  return reactive(() => {
    const vp = p.app
    return (
      <div>
        Grid: <b>{num(vp.grid.size.x)} * {num(vp.grid.size.y)}</b><br/>
        Grid (px): <b>{num(vp.pxGrid.size.x)} * {num(vp.pxGrid.size.y)}</b><br/><br/>
        Device (px): <b>{dumpArea(vp.device)}</b><br/><br/>
        Viewport: <b>{dumpArea(vp.viewport)}</b><br/>
        Viewport (px): <b>{dumpArea(vp.pxViewport)}</b><br/><br/>
        Dataport: <b>{dumpArea(vp.dataport)}</b><br/>
        Dataport (px): <b>{dumpArea(vp.pxDataport)}</b><br/><br/>
      </div>
    )
  })
}
