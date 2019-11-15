// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { DataViewport, place, reactive } from '@reactronic-toolkit-react'
import { ViewportDebugger } from '/components/ViewportDebugger'
import { Application } from '~m/Application'

import { style } from './AppWindow.css'
import { DataFragment } from './DataFragment'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const v = p.app.viewport
    const loader = p.app.loader
    const c = v.component
    const res = v.resolution
    return (
      <div className={css.window}>
        <DataViewport viewport={v} style={place(2, 2, 9, 9)}
          className={css.scroll} dataClassName={css.grid}>
          <DataFragment loader={loader} cellWidth={res.x} cellHeight={res.y}/>
        </DataViewport>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => c ? c.scrollTop += res.y : {}}
            disabled={!c}>▼</button>
          <button onClick={e => c ? c.scrollTop -= res.y : {}}
            disabled={!c}>▲</button>
          <button onClick={e => c ? c.scrollLeft += res.x : {}}
            disabled={!c}>►</button>
          <button onClick={e => c ? c.scrollLeft -= res.x : {}}
            disabled={!c}>◄</button>
          <button onClick={e => c ? c.scrollTop += 1072 : {}}
            disabled={!c}>▼ 1K px</button>
          <button onClick={e => c ? c.scrollTop -= 1072 : {}}
            disabled={!c}>▲ 1K px</button>
          <button onClick={e => c ? c.scrollTop = c.scrollHeight - c.clientHeight - 1 : {}}
            disabled={!c}>▼ End</button>
          <button onClick={e => c ? alert(`${c.scrollTop}, ${c.scrollHeight}, ${v.surface.size.y}`) : {}}
            disabled={!c}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <ViewportDebugger viewport={v}/>
        </div>
      </div>
    )
  })
}
