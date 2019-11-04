// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { getCachedResultAndRevalidate } from 'reactronic'
import { reactive, VirtualScroll, num } from '../../source/index'
import { place } from '../common'
import { Database } from '../model/Database'
import { ScrollVisualizer } from './ScrollVisualizer'
import { style } from './AppWindow.css'

export function AppWindow(p: {db: Database, vs: VirtualScroll}): JSX.Element {
  const ref = React.useCallback(component => {
    let pxPerRow = 16
    if (component) {
      const fs = window.getComputedStyle(component).fontSize
      pxPerRow = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.vs.setDevice(component, pxPerRow)
  }, [])
  return reactive(() => {
    const css = style.classes
    const d = p.vs.device
    return (
      <div className={css.window}>
        <div onScroll={e => p.vs.handleDeviceScroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
          ref={ref} className={css.scroll} style={place(2, 2, 9, 9)}>
          <Data db={p.db} vs={p.vs}/>
        </div>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => d ? d.scrollTop += 1 : {}}
            disabled={!d}>▼ 1 px</button>
          <button onClick={e => d ? d.scrollTop -= 1 : {}}
            disabled={!d}>▲ 1 px</button>
          <button onClick={e => d ? d.scrollTop += 1280 : {}}
            disabled={!d}>▼ 1K px</button>
          <button onClick={e => d ? d.scrollTop -= 1280 : {}}
            disabled={!d}>▲ 1K px</button>
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
    const size = p.vs.canvas.size
    const gap = p.vs.gap
    const d = getCachedResultAndRevalidate(p.db.data, [p.vs.bufferCellsWorkaround()]) || []
    return (
      <div className={css.content} key={'data'}
        title={`${num(size.x)}, ${num(size.y)}`}
        style={{boxSizing: 'border-box',
          width: `${size.x}px`, minWidth: `${size.x}px`, maxWidth: `${size.x}px`,
          height: `${size.y}px`, minHeight: `${size.y}px`, maxHeight: `${size.y}px`,
          paddingLeft: `${gap.x}px`, paddingTop: `${gap.y}px`}}>
        {d.map(row => (
          <div title={row[0]} key={row[0]}>
            {row.map(text => (
              <span key={text} style={{marginLeft: '1em'}}>{text}</span>
            ))}
          </div>
        ))}
      </div>
    )
  })
}
