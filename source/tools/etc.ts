// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

export function region(x1: number, y1: number, x2?: number, y2?: number): React.CSSProperties {
  if (x2 === undefined)
    x2 = x1
  if (y2 === undefined)
    y2 = y1
  return { gridColumn: `${x1} / span ${x2 - x1 + 1}`, gridRow: `${y1} / span ${y2 - y1 + 1}` }
}

export function spot(sizeX: number, sizeY: number, posX?: number, posY?: number): React.CSSProperties {
  const p: React.CSSProperties = {}
  p.width = p.minWidth = p.maxWidth = `${sizeX}px`
  p.height = p.minHeight = p.maxHeight = `${sizeY}px`
  if (posX !== undefined && posY !== undefined) {
    p.position = 'absolute'
    p.left = `${posX}px`
    p.top = `${posY}px`
  }
  else {
    p.position = 'relative'
    p.overflow = 'hidden'
    p.boxSizing = 'border-box'
  }
  return p
}

export function animationFrame(): Promise<number> {
  return new Promise(function (resolve: any) {
    requestAnimationFrame(resolve.bind(null, (time: number) => resolve(time)))
  })
}
