// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

export function place(x1: number, y1: number, x2?: number, y2?: number): React.CSSProperties {
  if (x2 === undefined)
    x2 = x1
  if (y2 === undefined)
    y2 = y1
  return { gridColumn: `${x1} / span ${x2 - x1 + 1}`, gridRow: `${y1} / span ${y2 - y1 + 1}` }
}
