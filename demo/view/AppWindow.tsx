// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { place, reactive, VirtualGrid } from '@reactronic-toolkit-react'
import { Application } from '/m/Application'
import { DataFragment } from '/v/DataFragment'
import { TelescopeDebugger } from '/view/TelescopeDebugger'

import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const t = p.app.telescope
    const loader = p.app.loader
    const elem = t.element
    const res = t.resolution
    return (
      <div className={css.window}>
        <VirtualGrid telescope={t} style={place(2, 2, 9, 9)}
          className={css.scroll} dataClassName={css.grid}>
          <DataFragment loader={loader} cellWidth={res.x} cellHeight={res.y}/>
        </VirtualGrid>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => elem ? elem.scrollTop += res.y : {}}
            disabled={!elem}>▼</button>
          <button onClick={e => elem ? elem.scrollTop -= res.y : {}}
            disabled={!elem}>▲</button>
          <button onClick={e => elem ? elem.scrollLeft += res.x : {}}
            disabled={!elem}>►</button>
          <button onClick={e => elem ? elem.scrollLeft -= res.x : {}}
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
          <TelescopeDebugger telescope={t}/>
        </div>
      </div>
    )
  })
}
