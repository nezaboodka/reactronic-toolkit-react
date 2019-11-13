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
    let pxPerRow = 16
    if (element) {
      const fs = window.getComputedStyle(element).fontSize
      pxPerRow = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.viewport.setElement(element, pxPerRow)
  }, [])

  return reactive(() => {
    const s = p.viewport.surface
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap', // temporary
      width: `${s.size.x}px`,
      minWidth: `${s.size.x}px`,
      maxWidth: `${s.size.x}px`,
      height: `${s.size.y}px`,
      minHeight: `${s.size.y}px`,
      maxHeight: `${s.size.y}px`,
    }
    const d = p.viewport.loaded
    const dataStyle: React.CSSProperties = {
      ...p.dataStyle,
      position: 'absolute',
      left: `${d.x - s.x}px`,
      top: `${d.y - s.y}px`,
      width: `${d.size.x}`,
      minWidth: `${d.size.x}`,
      maxWidth: `${d.size.x}`,
      height: `${d.size.y}`,
      minHeight: `${d.size.y}`,
      maxHeight: `${d.size.y}`,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.viewport.onScroll()}>
        <div style={surfaceStyle}>
          <div className={p.dataClassName} style={dataStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
