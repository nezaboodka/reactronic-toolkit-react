// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { cx } from 'emotion'
import { reactive, xy } from '../../source/index'
import { DataBuffer } from '../model/DataBuffer'
import { style } from './GridFrame.css'

export function GridFrame(p: {cellWidth: number, cellHeight: number, buffer: DataBuffer}): JSX.Element {
  return reactive(() => {
    const data = p.buffer.data
    const area = p.buffer.viewport.loadedCells
    const grid = p.buffer.viewport.grid
    const base = xy(area.x - grid.x, area.y - grid.y)
    const dim: React.CSSProperties = {
      width: `${p.cellWidth}px`,
      height: `${p.cellHeight}px`,
    }
    return (
      <React.Fragment>
        {data.map((line, row) => line.map((cell, col) => (
          <GridCell key={`r${base.y + row}c${base.x + col}: ${cell}`}
            hint={`r${base.y + row}c${base.x + col}: ${cell}`}
            row={base.y + row} col={base.x + col} text={cell}
            style={dim}/>
        )))}
      </React.Fragment>
    )
  })
}

export function GridCell(p: {hint: string, row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
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
