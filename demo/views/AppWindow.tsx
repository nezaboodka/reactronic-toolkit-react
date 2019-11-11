// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, Viewport, num } from '../../source/index'
import { place } from '../tools/common'
import { ViewportBuffer } from '../models/ViewportBuffer'
import { ScrollDebugger } from './ScrollDebugger'
import { ScrollBox } from '../../source/views/ScrollBox'
import { style } from './AppWindow.css'

export function AppWindow(p: {viewport: Viewport, buffer: ViewportBuffer}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const elem = p.viewport.element
    return (
      <div className={css.window}>
        <ScrollBox key="scroll" viewport={p.viewport} className={css.scroll} style={place(2, 2, 9, 9)}>
          <Data buffer={p.buffer}/>
        </ScrollBox>
        <div className={css.toolbar} style={place(10, 2, 10, 2)}>
          <button onClick={e => elem ? elem.scrollTop += 1 : {}}
            disabled={!elem}>▼ 1 px</button>
          <button onClick={e => elem ? elem.scrollTop -= 1 : {}}
            disabled={!elem}>▲ 1 px</button>
          <button onClick={e => elem ? elem.scrollTop += 1072 : {}}
            disabled={!elem}>▼ 1K px</button>
          <button onClick={e => elem ? elem.scrollTop -= 1072 : {}}
            disabled={!elem}>▲ 1K px</button>
          <button onClick={e => elem ? elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1 : {}}
            disabled={!elem}>▼ End</button>
          <button onClick={e => elem ? alert(`${elem.scrollTop}, ${elem.scrollHeight}, ${p.viewport.canvas.size.y}`) : {}}
            disabled={!elem}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <ScrollDebugger buffer={p.buffer} viewport={p.viewport}/>
        </div>
      </div>
    )
  })
}

function Data(p: {buffer: ViewportBuffer}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    const v = p.buffer.viewport
    const size = v.canvas.size
    const gap = v.bufferGap
    const sizing: React.CSSProperties = {
      boxSizing: 'border-box',
      width: `${size.x}px`,
      minWidth: `${size.x}px`,
      maxWidth: `${size.x}px`,
      height: `${size.y}px`,
      minHeight: `${size.y}px`,
      maxHeight: `${size.y}px`,
      paddingLeft: `${gap.x > 0 ? gap.x : 0}px`,
      marginLeft: `${gap.x < 0 ? gap.x : 0}px`,
      paddingTop: `${gap.y > 0 ? gap.y : 0}px`,
      marginTop: `${gap.y < 0 ? gap.y : 0}px`,
    }
    return (
      <div className={css.content} key={'data'}
        title={`v${counter}: ${num(size.x)}, ${num(size.y)}`}
        style={sizing}>
        {p.buffer.data.map(row => (
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
