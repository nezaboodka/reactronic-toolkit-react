// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { resolved } from 'reactronic'
import { reactive, VirtualScroll, xy } from '../../source/index'
import { place } from '../common'
import { Database } from '../model/Database'
import { ScrollVisualizer } from './ScrollVisualizer'
import { style } from './AppWindow.css'

export function AppWindow(p: {scroll: VirtualScroll, db: Database}): JSX.Element {
  const ref = React.useCallback(element => p.scroll.setDevice(element), [])
  return reactive(() => {
    const css = style.classes
    return (
      <div className={css.window}>
        <div ref={ref} onScroll={e => p.scroll.scrollTo(xy(e.currentTarget.scrollLeft, e.currentTarget.scrollTop))}
          className={css.scroll} style={place(2, 2, 9, 9)}>
          <div className={css.content}>
            <Data db={p.db} scroll={p.scroll}/>
          </div>
        </div>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => p.scroll.device ? p.scroll.device.scrollTop += 1 : {}}>▼ 1px</button>
          <button onClick={e => p.scroll.device ? p.scroll.device.scrollTop -= 1 : {}}>▲ 1px</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <ScrollVisualizer scroll={p.scroll}/>
        </div>
      </div>
    )
  })
}

function Data(p: {scroll: VirtualScroll, db: Database}): JSX.Element {
  return reactive(() => {
    const d = resolved(p.db.data, [p.scroll.dataport()]) || []
    return (
      <React.Fragment>
        {d.map(row => (
          <div key={row[0]}>
            {row.map(text => (
              <span key={text} style={{marginLeft: '1em'}}>{text}</span>
            ))}
          </div>
        ))}
      </React.Fragment>
    )
  })
}
