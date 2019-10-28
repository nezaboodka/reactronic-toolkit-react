// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/reactive'
import { place } from '../common'
import { style } from './AppWindow.css'
import { xy } from '../../source/Area'
import { VirtualScroll } from '../../source/VirtualScroll'
import { ScrollVisualizer } from './ScrollVisualizer'

export function AppWindow(p: {scroll: VirtualScroll}): JSX.Element {
  const ref = React.useCallback(element => p.scroll.setDevice(element), [])
  return reactive(() => {
    const css = style.classes
    // const items: string[] = []
    // for (let i = 0; i < p.app.grid.size.y; i++)
    //   items.push(`[${i}]`)
    const deviceHeight = p.scroll.grid.size.y < 100000 ? p.scroll.grid.size.y : 100000
    return (
      <div className={css.window}>
        <div ref={ref} onScroll={e => p.scroll.scrollTo(xy(e.currentTarget.scrollLeft, e.currentTarget.scrollTop))}
          className={css.scroll} style={place(2, 2, 9, 9)}>
          <div className={css.content} style={{height: `${deviceHeight}em`}}>
            {/* {items.map((s, i) => <div>{s}</div>)} */}
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
