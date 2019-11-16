// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, xy } from '@reactronic-toolkit-react'
import { DataLoader } from '/app/DataLoader'

import { style } from './DataFragment.css'

export function DataFragment(p: {loader: DataLoader}): JSX.Element {
  return reactive(() => {
    const data = p.loader.data
    const vp = p.loader.viewport
    const cells = vp.loadedCells
    const tg = vp.targetGrid
    const zero = xy(cells.x - tg.x, cells.y - tg.y)
    const dim: React.CSSProperties = {
      width: `${vp.resolution.x}px`,
      height: `${vp.resolution.y}px`,
    }
    return (
      <React.Fragment>
        {data.map((cell, i) => {
          const y = Math.floor(i / cells.size.x)
          const x = i % cells.size.x
          const r = zero.y + y
          const c = zero.x + x
          const key = `R${r}C${c}:Y${cells.y + y}X${cells.x + x}`
          return (
            <GridCell key={key} hint={key} style={dim}
              row={r} col={c} text={cell}/>
          )
        })}
      </React.Fragment>
    )
  })
}

function GridCell(p: {hint: string, row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
  const css = style.classes
  const place: React.CSSProperties = {
    ...p.style,
    gridRow: p.row + 1,
    gridColumn: p.col + 1,
  }
  return (
    <div title={`${p.hint}`} className={cx(css.cell, css.blink1)} style={place}>
      {p.text}
    </div>
  )
}
