// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { VirtualGrid } from '../lib/VirtualGrid'
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
      p.grid.reset(e.clientWidth, e.clientHeight, resolution, e)
    }
    else
      p.grid.reset(0, 0, 1, undefined)
  }, [])

  return reactive(() => {
    const sf = p.grid.surfaceArea
    const sfw = `${sf.size.x}px`
    const sfh = `${sf.size.y}px`
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: sfw, minWidth: sfw, maxWidth: sfw,
      height: sfh, minHeight: sfh, maxHeight: sfh,
    }
    const ready = p.grid.readyArea
    const rw = `${ready.size.x}px`
    const rh = `${ready.size.y}px`
    const fragmentStyle: React.CSSProperties = {
      ...p.fragmentStyle,
      position: 'absolute',
      left: `${ready.x - sf.x}px`,
      top: `${ready.y - sf.y}px`,
      width: rw, minWidth: rw, maxWidth: rw,
      height: rh, minHeight: rh, maxHeight: rh,
    }
    return (
      <div className={p.className} style={p.style}
        ref={ref} tabIndex={1}
        onScroll={e => p.grid.scroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
        onWheel={e => p.grid.interact(false)}
        onPointerDown={e => p.grid.interact(false)}
        onKeyDown={e => p.grid.interact(e.key === 'Home' || e.key === 'End')}>
        <div style={surfaceStyle}>
          <div className={p.fragmentClassName} style={fragmentStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
