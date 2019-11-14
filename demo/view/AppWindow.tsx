// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { place, reactive, VirtualGrid } from '@reactronic-toolkit-react'
import { TelescopeDebugger } from '/components/TelescopeDebugger'
import { Application } from '~m/Application'

import { style } from './AppWindow.css'
import { DataFragment } from './DataFragment'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const t = p.app.telescope
    const loader = p.app.loader
    const d = t.display
    const res = t.resolution
    return (
      <div className={css.window}>
        <VirtualGrid telescope={t} style={place(2, 2, 9, 9)}
          className={css.scroll} dataClassName={css.grid}>
          <DataFragment loader={loader} cellWidth={res.x} cellHeight={res.y}/>
        </VirtualGrid>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => d ? d.scrollTop += res.y : {}}
            disabled={!d}>▼</button>
          <button onClick={e => d ? d.scrollTop -= res.y : {}}
            disabled={!d}>▲</button>
          <button onClick={e => d ? d.scrollLeft += res.x : {}}
            disabled={!d}>►</button>
          <button onClick={e => d ? d.scrollLeft -= res.x : {}}
            disabled={!d}>◄</button>
          <button onClick={e => d ? d.scrollTop += 1072 : {}}
            disabled={!d}>▼ 1K px</button>
          <button onClick={e => d ? d.scrollTop -= 1072 : {}}
            disabled={!d}>▲ 1K px</button>
          <button onClick={e => d ? d.scrollTop = d.scrollHeight - d.clientHeight - 1 : {}}
            disabled={!d}>▼ End</button>
          <button onClick={e => d ? alert(`${d.scrollTop}, ${d.scrollHeight}, ${t.surface.size.y}`) : {}}
            disabled={!d}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <TelescopeDebugger telescope={t}/>
        </div>
      </div>
    )
  })
}
