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
import { ScrollBox } from '../../source/view/ScrollBox'
import { style } from './AppWindow.css'

export function AppWindow(p: {db: Database, vs: VirtualScroll}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const d = p.vs.device
    return (
      <div className={css.window}>
        <ScrollBox vs={p.vs} className={css.scroll} style={place(2, 2, 9, 9)}>
          <Data db={p.db} vs={p.vs}/>
        </ScrollBox>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => d ? d.scrollTop += 1 : {}}
            disabled={!d}>▼ 1 px</button>
          <button onClick={e => d ? d.scrollTop -= 1 : {}}
            disabled={!d}>▲ 1 px</button>
          <button onClick={e => d ? d.scrollTop += 1072 : {}}
            disabled={!d}>▼ 1K px</button>
          <button onClick={e => d ? d.scrollTop -= 1072 : {}}
            disabled={!d}>▲ 1K px</button>
          <button onClick={e => d ? d.scrollTop = d.scrollHeight - d.clientHeight - 1 : {}}
            disabled={!d}>▼ End</button>
          <button onClick={e => d ? alert(`${d.scrollTop}, ${d.scrollHeight}, ${p.vs.canvas.size.y}`) : {}}
            disabled={!d}>▲ Begin</button>
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
    const gap = p.vs.bufferGap
    const sizing: React.CSSProperties = {
      boxSizing: 'border-box',
      width: `${size.x}px`,
      minWidth: `${size.x}px`,
      maxWidth: `${size.x}px`,
      height: `${size.y}px`,
      minHeight: `${size.y}px`,
      maxHeight: `${size.y}px`,
      paddingLeft: gap.x > 0 ? gap.x : 0,
      marginLeft: gap.x < 0 ? gap.x : 0,
      paddingTop: gap.y > 0 ? gap.y : 0,
      marginTop: gap.y < 0 ? gap.y : 0,
    }
    const d = getCachedResultAndRevalidate(p.db.data, [p.vs.bufferCellsWorkaround()]) || []
    return (
      <div className={css.content} key={'data'}
        title={`${num(size.x)}, ${num(size.y)}`}
        style={sizing}>
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
