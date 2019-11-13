// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, Viewport } from '../index'

export function VirtualScroll(p: {
  viewport: Viewport,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties}): JSX.Element {
  const ref = React.useCallback(element => {
    let pxPerRow = 16
    if (element) {
      const fs = window.getComputedStyle(element).fontSize
      pxPerRow = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.viewport.setElement(element, pxPerRow)
  }, [])
  return reactive(() => {
    const vp = p.viewport
    const canvas = vp.canvas
    const loaded = vp.loaded
    const cs: React.CSSProperties = {} // canvas style
    cs.position = 'relative'
    cs.overflow = 'hidden'
    cs.boxSizing = 'border-box'
    cs.whiteSpace = 'nowrap' // temporary
    cs.width = cs.minWidth = cs.maxWidth = `${canvas.size.x}px`
    cs.height = cs.minHeight = cs.maxHeight = `${canvas.size.y}px`
    const ls: React.CSSProperties = {} // loaded style
    ls.position = 'absolute'
    ls.left = `${loaded.x - canvas.x}px`
    ls.top = `${loaded.y - canvas.y}px`
    ls.width = ls.minWidth = ls.maxWidth = `${loaded.size.x}`
    ls.height = ls.minHeight = ls.maxHeight = `${loaded.size.y}`
    return (
      <div ref={ref} onScroll={e => p.viewport.onScroll()}
        className={p.className} style={p.style}>
        <div style={cs}>
          <div style={ls}>{p.children}</div>
        </div>
      </div>
    )
  })
}
