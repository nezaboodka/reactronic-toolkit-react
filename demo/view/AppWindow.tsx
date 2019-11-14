// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, place } from '@toolkit'
import { AppDebugger } from './AppDebugger'
import { VirtualScroll } from '../../source/components/VirtualScroll'
import { Application } from '../model/Application'
import { GridFrame } from './GridFrame'
import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const vp = p.app.projector
    const buf = p.app.buffer
    const elem = vp.element
    const xRes = vp.resolution * vp.sizing.defaultCellWidthFactor
    const yRes = vp.resolution
    return (
      <div className={css.window}>
        <VirtualScroll projector={vp}
          className={css.scroll} style={place(2, 2, 9, 9)}
          dataClassName={css.grid}>
          <GridFrame buffer={buf} cellWidth={xRes} cellHeight={yRes}/>
        </VirtualScroll>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => elem ? elem.scrollTop += yRes : {}}
            disabled={!elem}>▼</button>
          <button onClick={e => elem ? elem.scrollTop -= yRes : {}}
            disabled={!elem}>▲</button>
          <button onClick={e => elem ? elem.scrollLeft += xRes : {}}
            disabled={!elem}>►</button>
          <button onClick={e => elem ? elem.scrollLeft -= xRes : {}}
            disabled={!elem}>◄</button>
          <button onClick={e => elem ? elem.scrollTop += 1072 : {}}
            disabled={!elem}>▼ 1K px</button>
          <button onClick={e => elem ? elem.scrollTop -= 1072 : {}}
            disabled={!elem}>▲ 1K px</button>
          <button onClick={e => elem ? elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1 : {}}
            disabled={!elem}>▼ End</button>
          <button onClick={e => elem ? alert(`${elem.scrollTop}, ${elem.scrollHeight}, ${vp.surface.size.y}`) : {}}
            disabled={!elem}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <AppDebugger projector={vp} buffer={buf}/>
        </div>
      </div>
    )
  })
}
