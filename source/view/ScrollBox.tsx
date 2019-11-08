// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive, VirtualScroll } from '../../source/index'

export function ScrollBox(p: {
  vs: VirtualScroll,
  children: JSX.Element,
  className?: string,
  style?: React.CSSProperties}): JSX.Element {
  const ref = React.useCallback(component => {
    let pxPerRow = 16
    if (component) {
      const fs = window.getComputedStyle(component).fontSize
      pxPerRow = parseFloat(fs.substr(0, fs.length - 2))
    }
    p.vs.setDevice(component, pxPerRow)
  }, [])
  return reactive(() => {
    return (
      <div ref={ref} onScroll={e => p.vs.handleDeviceScroll()}
        className={p.className} style={p.style}>
        {p.children}
      </div>
    )
  })
}
