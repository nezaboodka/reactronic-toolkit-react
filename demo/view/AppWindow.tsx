// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/index'
import { place } from '../tools/common'
import { DataBuffer } from '../model/DataBuffer'
import { AppDebugger } from './AppDebugger'
import { VirtualScroll } from '../../source/components/VirtualScroll'
import { Application } from '../model/Application'
import { style } from './AppWindow.css'

export function AppWindow(p: {app: Application}): JSX.Element {
  return reactive(() => {
    const css = style.classes
    const vp = p.app.viewport
    const buf = p.app.buffer
    const elem = vp.element
    return (
      <div className={css.window}>
        <VirtualScroll viewport={vp}
          className={css.scroll} style={place(2, 2, 9, 9)}>
          <Data buffer={buf}/>
        </VirtualScroll>
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
          <button onClick={e => elem ? alert(`${elem.scrollTop}, ${elem.scrollHeight}, ${vp.canvas.size.y}`) : {}}
            disabled={!elem}>▲ Begin</button>
        </div>
        <div className={css.visualizer} style={place(10, 3, 10, 5)}>
          <AppDebugger buffer={buf} viewport={vp}/>
        </div>
      </div>
    )
  })
}

function Data(p: {buffer: DataBuffer}): JSX.Element {
  return reactive(() => {
    const data = p.buffer.data
    return (
      <React.Fragment>
        {data.map(row => (
          <div title={row[0]} key={row[0]}>
            {row.map(text => (
              <span key={text} style={{marginLeft: '1em'}}>{text}</span>
            ))}
          </div>
        ))}
      </React.Fragment>
    )
  })
}
