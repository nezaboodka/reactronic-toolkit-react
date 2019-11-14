// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, xy } from '@reactronic-toolkit-react'
import { DataBuffer } from '~/model/DataBuffer'

import { style } from './GridFrame.css'

export function GridFrame(p: {cellWidth: number, cellHeight: number, buffer: DataBuffer}): JSX.Element {
  return reactive(() => {
    const data = p.buffer.data
    const vp = p.buffer.projector
    const area = vp.loadedCells
    const grid = vp.surfaceGrid
    const origin = xy(area.x - grid.x, area.y - grid.y)
    const dim: React.CSSProperties = { width: `${p.cellWidth}px`, height: `${p.cellHeight}px` }
    return (
      <React.Fragment>
        {data.map((cell, i) => {
          const y = Math.floor(i / area.size.x)
          const x = i % area.size.x
          const r = origin.y + y
          const c = origin.x + x
          const key = `R${r}C${c}:Y${area.y + y}X${area.x + x}`
          return (
            <Cell key={key} hint={key} style={dim}
              row={r} col={c} text={cell}/>
          )
        })}
      </React.Fragment>
    )
  })
}

function Cell(p: {hint: string, row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
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
