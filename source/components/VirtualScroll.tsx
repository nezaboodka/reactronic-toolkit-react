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
    const size = vp.canvas.size
    const gap = vp.getGap()
    const sizing: React.CSSProperties = {
      boxSizing: 'border-box', overflow: 'hidden',
      width: `${size.x}px`, minWidth: `${size.x}px`, maxWidth: `${size.x}px`,
      height: `${size.y}px`, minHeight: `${size.y}px`, maxHeight: `${size.y}px`,
      paddingLeft: `${gap.x > 0 ? gap.x : 0}px`,
      marginLeft: `${gap.x < 0 ? gap.x : 0}px`,
      paddingTop: `${gap.y > 0 ? gap.y : 0}px`,
      marginTop: `${gap.y < 0 ? gap.y : 0}px`,
    }
    return (
      <div ref={ref} onScroll={e => p.viewport.onScroll()}
        className={p.className} style={p.style}>
        <div style={sizing}>
          {p.children}
        </div>
      </div>
    )
  })
}
