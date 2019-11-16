// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { place, reactive, ScrollBox, ViewportDebugger } from '@reactronic-toolkit-react'
import { Application } from '/app/Application'
import { DataFragment } from '/view/DataFragment'

import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const vp = p.app.viewport
    const loader = p.app.loader
    const c = vp.component
    const res = vp.resolution
    return (
      <div className={css.window}>
        <ScrollBox viewport={vp} style={place(2, 2, 9, 9)}
          className={css.scroll} dataClassName={css.grid}>
          <DataFragment loader={loader} cellWidth={res.x} cellHeight={res.y}/>
        </ScrollBox>
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
          <button onClick={e => c ? alert(`${c.scrollTop}, ${c.scrollHeight}, ${vp.surface.size.y}`) : {}}
            disabled={!c}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <ViewportDebugger viewport={vp}/>
        </div>
      </div>
    )
  })
}
