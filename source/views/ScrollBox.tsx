// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, Viewport } from '../index'

export function ScrollBox(p: {
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
    return (
      <div ref={ref}
        onScroll={e => p.viewport.onScroll()}
        onPointerDown={e => p.viewport.onPointerDown()}
        onPointerUp={e => p.viewport.onPointerUp()}
        className={p.className} style={p.style}>
        {p.children}
      </div>
    )
  })
}
