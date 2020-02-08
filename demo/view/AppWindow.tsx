// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { TraceLevel } from 'reactronic'

import { reactive, region, ScrollBox, ScrollDebugger } from '~/../source/reactronic-toolkit-react'
import { Application } from '~/app/Application'
import { GridFragment } from '~/view/GridFragment'

import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.css
    const grid = p.app.grid
    const c = grid.component
    const loader = p.app.loader
    return (
      <div className={css.main}>
        <ScrollBox grid={grid} className={css.scroll} style={region(2, 2, 9, 9)}>
          <GridFragment loader={loader} className={css.grid}/>
        </ScrollBox>
        <div className={css.toolbar} style={region(10, 2, 10, 2)}>
          <button onClick={e => c ? c.scrollTop += grid.ppcY : {}}
            disabled={!c}>▼</button>
          <button onClick={e => c ? c.scrollTop -= grid.ppcY : {}}
            disabled={!c}>▲</button>
          <button onClick={e => c ? c.scrollLeft += grid.ppcX : {}}
            disabled={!c}>►</button>
          <button onClick={e => c ? c.scrollLeft -= grid.ppcX : {}}
            disabled={!c}>◄</button>
          <button onClick={e => c ? c.scrollTop += 2.5*grid.viewportSizeY : {}}
            disabled={!c}>▼ 1K px</button>
          <button onClick={e => c ? c.scrollTop -= 1072 : {}}
            disabled={!c}>▲ 1K px</button>
          <button onClick={e => c ? c.scrollTop = grid.surfaceSizeY - grid.viewportSizeY - 1 : {}}
            disabled={!c}>▼ End</button>
          {/* <button onClick={e => c ? alert(`${c.scrollTop}, ${c.scrollHeight}, ${g.surface.size.y}`) : {}}
            disabled={!c}>▲ Begin</button> */}
        </div>
        <div className={css.debugger} style={region(10, 3, 10, 5)}>
          <ScrollDebugger grid={grid}/>
        </div>
      </div>
    )
  }, {trace: TraceLevel.Suppress})
}
