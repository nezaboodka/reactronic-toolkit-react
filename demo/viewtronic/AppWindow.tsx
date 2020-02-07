// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { region, ScrollBox, ScrollDebugger } from '~/../source/reactronic-toolkit-react'
import { Application } from '~/app/Application'
import { style } from '~/view/AppWindow.css'
import { GridFragment } from '~/view/GridFragment'
import { button, div } from '~/viewtronic/html'

export function AppWindow(id: string, app: Application): void {
  div(id, e => {
    const css = style.classes
    const grid = app.grid
    const c = grid.component
    const loader = app.loader
    div('main', e => {
      e.className = css.main
      // <ScrollBox grid={grid} className={css.scroll} style={region(2, 2, 9, 9)}>
      //   <GridFragment loader={loader} className={css.grid}/>
      // </ScrollBox>
      div('toolbar', e => {
        e.className = css.toolbar
        // e.style = {region(10, 2, 10, 2)}
        button('down', e => {
          e.onclick = event => c ? c.scrollTop += grid.ppcY : {}
          e.disabled = !c
          e.innerText = '▼'
        })
        button('up', e => {
          e.onclick = event => c ? c.scrollTop -= grid.ppcY : {}
          e.disabled = !c
          e.innerText = '▲'
        })
        button('right', e => {
          e.onclick = event => c ? c.scrollLeft += grid.ppcX : {}
          e.disabled = !c
          e.innerText = '►'
        })
        button('left', e => {
          e.onclick = event => c ? c.scrollLeft -= grid.ppcX : {}
          e.disabled = !c
          e.innerText = '◄'
        })
        button('pageDown', e => {
          e.onclick = event => c ? c.scrollTop += 2.5*grid.viewportSizeY  : {}
          e.disabled = !c
          e.innerText = '▼ 1K px'
        })
        button('pageUp', e => {
          e.onclick = event => c ? c.scrollTop -= 2.5*grid.viewportSizeY  : {}
          e.disabled = !c
          e.innerText = '▲ 1K px'
        })
        button('home', e => {
          e.onclick = event => c ? c.scrollTop = grid.surfaceSizeY - grid.viewportSizeY - 1  : {}
          e.disabled = !c
          e.innerText = '▼ End'
        })
        // {/* <button onClick={e => c ? alert(`${c.scrollTop}, ${c.scrollHeight}, ${g.surface.size.y}`) : {}}
        //   disabled={!c}>▲ Begin</button> */}
      })
      div('debugger', e => {
        e.className = css.debugger
        // e.style={region(10, 3, 10, 5)}
        // <ScrollDebugger grid={grid}/>
      })
    })
  }) // {trace: TraceLevel.Suppress})
}
