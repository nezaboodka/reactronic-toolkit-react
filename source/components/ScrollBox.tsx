// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { VirtualGrid } from '../lib/VirtualGrid'
import { spot } from '../tools/etc'
import { reactive } from '../tools/reactive'

export function ScrollBox(p: {
  grid: VirtualGrid,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties,
  fragmentClassName?: string,
  fragmentStyle?: React.CSSProperties}): JSX.Element {

  const ref = React.useCallback((e: HTMLDivElement | null) => {
    if (e) {
      const fs = window.getComputedStyle(e).fontSize
      const resolution = parseFloat(fs.substr(0, fs.length - 2))
      p.grid.mount(e.clientWidth, e.clientHeight, resolution, e)
    }
    else
      p.grid.mount(0, 0, 1, undefined)
  }, [])

  return reactive(cycle => {
    return (
      <div className={p.className} style={p.style}
        ref={ref} tabIndex={1}
        onScroll={e => p.grid.scroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
        onWheel={e => p.grid.impulse()}
        onPointerDown={e => p.grid.impulse()}
        onKeyDown={e => p.grid.impulse(e.key)}>
        <div style={{position: 'absolute', left: '3em', top:'3em', color: 'yellow', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>scroll box: cycle {cycle}<br/>{window.rWhy}</div>
        <div style={spot(p.grid.surfaceSizeX, p.grid.surfaceSizeY)}>
          <ScrollBoxSpot key={p.grid.containerId} grid={p.grid}
            className={p.fragmentClassName} style={p.fragmentStyle}>
            {p.children}
          </ScrollBoxSpot>
        </div>
      </div>
    )
  })
}

function ScrollBoxSpot(p: {
  grid: VirtualGrid,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties}): JSX.Element {

  return reactive(cycle => {
    return p.children
  }, ScrollBoxSpot.name)
}
