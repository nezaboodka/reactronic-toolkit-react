// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

import { VirtualScroll } from '../lib/VirtualScroll'
import { reactive } from '../tools/reactive'

export function ScrollBox(p: {
  scroll: VirtualScroll,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties,
  fragmentClassName?: string,
  fragmentStyle?: React.CSSProperties}): JSX.Element {

  const ref = React.useCallback(element => {
    let resolution = 1
    if (element) {
      const fs = window.getComputedStyle(element).fontSize
      resolution = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.scroll.setComponent(element, resolution)
  }, [])

  return reactive(() => {
    const surface = p.scroll.surface
    const sw = `${surface.size.x}px`
    const sh = `${surface.size.y}px`
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: sw, minWidth: sw, maxWidth: sw,
      height: sh, minHeight: sh, maxHeight: sh,
    }
    const ready = p.scroll.ready
    const rw = `${ready.size.x}px`
    const rh = `${ready.size.y}px`
    const fragmentStyle: React.CSSProperties = {
      ...p.fragmentStyle,
      position: 'absolute',
      left: `${ready.x - surface.x}px`,
      top: `${ready.y - surface.y}px`,
      width: rw, minWidth: rw, maxWidth: rw,
      height: rh, minHeight: rh, maxHeight: rh,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.scroll.onScroll()}>
        <div style={surfaceStyle}>
          <div className={p.fragmentClassName} style={fragmentStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
