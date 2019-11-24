// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { XY, xy } from '../lib/Area'
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
        {/* <div style={{position: 'absolute', left: '3em', top:'3em', color: 'yellow', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>scroll box: {cycle} cycle<br/>{window.rWhy}</div> */}
        <div style={place(p.grid.surfaceSizeX, p.grid.surfaceSizeY)}>
          <ScrollBoxTargetGrid grid={p.grid}
            className={p.fragmentClassName} style={p.fragmentStyle}>
            {p.children}
          </ScrollBoxTargetGrid>
        </div>
      </div>
    )
  })
}

function ScrollBoxTargetGrid(p: {
  grid: VirtualGrid,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties}): JSX.Element {
  return reactive(cycle => {
    //const sf = p.grid.surfaceArea
    const vg = p.grid
    const ra = vg.readyArea.relativeTo(xy(vg.surfaceX, vg.surfaceY))
    const style = { ...p.style, ...place(ra.size.x, ra.size.y, ra.x, ra.y) }
    return (
      <div className={p.className} style={style}>
        {/* <div style={{position: 'fixed', left: '4em', top:'6em', color: 'lightgreen', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>target grid: {cycle} cycle<br/>{window.rWhy}</div> */}
        {p.children}
      </div>
    )
  }, ScrollBoxTargetGrid.name)
}

function place(sizeX: number, sizeY: number, posX?: number, posY?: number): React.CSSProperties {
  const p: React.CSSProperties = {}
  p.width = p.minWidth = p.maxWidth = `${sizeX}px`
  p.height = p.minHeight = p.maxHeight = `${sizeY}px`
  if (posX !== undefined && posY !== undefined) {
    p.position = 'absolute'
    p.left = `${posX}px`
    p.top = `${posY}px`
  }
  else {
    p.position = 'relative'
    p.overflow = 'hidden'
    p.boxSizing = 'border-box'
  }
  return p
}
