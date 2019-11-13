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
    const vp = p.viewport
    const canvas = vp.canvas
    const canvasStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap', // temporary
      width: `${canvas.size.x}px`,
      minWidth: `${canvas.size.x}px`,
      maxWidth: `${canvas.size.x}px`,
      height: `${canvas.size.y}px`,
      minHeight: `${canvas.size.y}px`,
      maxHeight: `${canvas.size.y}px`,
    }
    const data = vp.loaded
    const dataStyle: React.CSSProperties = {
      ...p.dataStyle,
      position: 'absolute',
      left: `${data.x - canvas.x}px`,
      top: `${data.y - canvas.y}px`,
      width: `${data.size.x}`,
      minWidth: `${data.size.x}`,
      maxWidth: `${data.size.x}`,
      height: `${data.size.y}`,
      minHeight: `${data.size.y}`,
      maxHeight: `${data.size.y}`,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.viewport.onScroll()}>
        <div style={canvasStyle}>
          <div className={p.dataClassName} style={dataStyle}>{p.children}</div>
        </div>
      </div>
    )
  })
}
