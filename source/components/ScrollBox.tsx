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
    const s = p.scroll.surface
    const sw = `${s.size.x}px`
    const sh = `${s.size.y}px`
    const surfaceStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: sw, minWidth: sw, maxWidth: sw,
      height: sh, minHeight: sh, maxHeight: sh,
    }
    const r = p.scroll.rendered
    const rw = `${r.size.x}px`
    const rh = `${r.size.y}px`
    const fragmentStyle: React.CSSProperties = {
      ...p.fragmentStyle,
      position: 'absolute',
      left: `${r.x - s.x}px`,
      top: `${r.y - s.y}px`,
      width: rw, minWidth: rw, maxWidth: rw,
      height: rh, minHeight: rh, maxHeight: rh,
    }
    return (
      <div ref={ref} className={p.className} style={p.style}
        onScroll={e => p.scroll.scroll()}>
        <div style={surfaceStyle}>
          <div className={p.fragmentClassName} style={fragmentStyle}>
            {p.children}
          </div>
        </div>
      </div>
    )
  })
}
