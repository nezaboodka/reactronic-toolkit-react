// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { XY } from '../lib/Area'
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
        {/* <div style={{position: 'absolute', left: '3em', top:'3em', color: 'yellow', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>cycle: {cycle}<br/>{window.rWhy}</div> */}
        <ScrollBoxGridFragment grid={p.grid}
          className={p.fragmentClassName} style={p.fragmentStyle}>
          {p.children}
        </ScrollBoxGridFragment>
      </div>
    )
  })
}

function ScrollBoxGridFragment(p: {
  grid: VirtualGrid,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties}): JSX.Element {
  return reactive(() => {
    const sf = p.grid.surfaceArea
    const ra = p.grid.readyArea.relativeTo(sf)
    const style = { ...p.style, ...place(ra.size, ra) }
    return (
      <div style={place(sf.size)}>
        <div className={p.className} style={style}>
          {p.children}
        </div>
      </div>
    )
  }, ScrollBoxGridFragment.name)
}

function place(size: XY, pos?: XY): React.CSSProperties {
  const p: React.CSSProperties = {}
  p.width = p.minWidth = p.maxWidth = `${size.x}px`
  p.height = p.minHeight = p.maxHeight = `${size.y}px`
  if (pos) {
    p.position = 'absolute'
    p.left = `${pos.x}px`
    p.top = `${pos.y}px`
  }
  else {
    p.position = 'relative'
    p.overflow = 'hidden'
    p.boxSizing = 'border-box'
  }
  return p
}
