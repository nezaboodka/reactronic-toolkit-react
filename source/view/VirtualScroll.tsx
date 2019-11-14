// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { Projector } from '/model/Projector'
import { reactive } from '/tools/reactive.ts'

export function VirtualScroll(p: {
  projector: Projector,
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
    p.projector.setElement(element, resolution)
  }, [])

  return reactive(() => {
    const s = p.projector.surface
    const sw = `${s.size.x}px`
    const sh = `${s.size.y}px`
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: sw, minWidth: sw, maxWidth: sw,
      height: sh, minHeight: sh, maxHeight: sh,
    }
    const l = p.projector.loaded
    const lw = `${l.size.x}`
    const lh = `${l.size.y}`
    const dataStyle: React.CSSProperties = {
      ...p.dataStyle,
      position: 'absolute',
      left: `${l.x - s.x}px`,
      top: `${l.y - s.y}px`,
      width: lw, minWidth: lw, maxWidth: lw,
      height: lh, minHeight: lh, maxHeight: lh,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.projector.handleElementScroll()}
        onWheel={e => p.projector.handleElementWheel(e.deltaX, e.deltaY, e.deltaZ, e.deltaMode)}>
        <div style={surfaceStyle}>
          <div className={p.dataClassName} style={dataStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
