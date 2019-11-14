// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { place, reactive, VirtualScroll } from '@reactronic-toolkit-react'
import { Application } from '/m/Application'
import { AppDebugger } from '/v/AppDebugger'
import { GridFrame } from '/v/GridFrame'

import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const t = p.app.telescope
    const buf = p.app.buffer
    const elem = t.element
    const xRes = t.resolution * t.sizing.defaultCellWidthFactor
    const yRes = t.resolution
    return (
      <div className={css.window}>
        <VirtualScroll telescope={t}
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
          <button onClick={e => elem ? alert(`${elem.scrollTop}, ${elem.scrollHeight}, ${t.surface.size.y}`) : {}}
            disabled={!elem}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <AppDebugger telescope={t} buffer={buf}/>
        </div>
      </div>
    )
  })
}
