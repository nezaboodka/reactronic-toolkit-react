// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { resolved } from 'reactronic'
import { reactive, VirtualScroll } from '../../source/index'
import { place } from '../common'
import { Database } from '../model/Database'
import { ScrollVisualizer } from './ScrollVisualizer'
import { style } from './AppWindow.css'

export function AppWindow(p: {db: Database, vs: VirtualScroll}): JSX.Element {
  const deviceRef = React.useCallback(element => p.vs.setComponent(element), [])
  return reactive(() => {
    const css = style.classes
    const d = p.vs.component
    return (
      <div className={css.window}>
        <div onScroll={e => p.vs.onScroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
          ref={deviceRef} className={css.scroll} style={place(2, 2, 9, 9)}>
          <Data db={p.db} vs={p.vs}/>
        </div>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => d ? d.scrollTop += 1 : {}}
            disabled={!d}>▼ 1px</button>
          <button onClick={e => d ? d.scrollTop -= 1 : {}}
            disabled={!d}>▲ 1px</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <ScrollVisualizer scroll={p.vs}/>
        </div>
      </div>
    )
  })
}

function Data(p: {db: Database, vs: VirtualScroll}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const size = p.vs.pxDeviceArea.size
    const padding = p.vs.pxDataMargin
    const d = resolved(p.db.data, [p.vs.cachedDataArea()]) || []
    return (
      <div className={css.content} key={'data'}
        style={{
          width: `${size.x}px`, minWidth: `${size.x}px`, maxWidth: `${size.x}px`,
          height: `${size.y}px`, minHeight: `${size.y}px`, maxHeight: `${size.y}px`,
          paddingLeft: `${padding.x}px`, paddingTop: `${padding.y}px`}}>
        {d.map(row => (
          <div key={row[0]}>
            {row.map(text => (
              <span key={text} style={{marginLeft: '1em'}}>{text}</span>
            ))}
          </div>
        ))}
      </div>
    )
  })
}
