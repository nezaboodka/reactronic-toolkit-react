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
  dataClassName?: string,
  style?: React.CSSProperties,
  dataStyle?: React.CSSProperties}): JSX.Element {

  const ref = React.useCallback(element => {
    let resolution = 1
    if (element) {
      const fs = window.getComputedStyle(element).fontSize
      resolution = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.viewport.setElement(element, resolution)
  }, [])

  return reactive(() => {
    const s = p.viewport.surface
    const sw = `${s.size.x}px`
    const sh = `${s.size.y}px`
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: sw, minWidth: sw, maxWidth: sw,
      height: sh, minHeight: sh, maxHeight: sh,
    }
    const d = p.viewport.loaded
    const dw = `${d.size.x}`
    const dh = `${d.size.y}`
    const dataStyle: React.CSSProperties = {
      ...p.dataStyle,
      position: 'absolute',
      left: `${d.x - s.x}px`,
      top: `${d.y - s.y}px`,
      width: dw, minWidth: dw, maxWidth: dw,
      height: dh, minHeight: dh, maxHeight: dh,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.viewport.handleElementScroll()}
        onWheel={e => p.viewport.handleElementWheel(e.deltaX, e.deltaY, e.deltaZ, e.deltaMode)}>
        <div style={surfaceStyle}>
          <div className={p.dataClassName} style={dataStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
