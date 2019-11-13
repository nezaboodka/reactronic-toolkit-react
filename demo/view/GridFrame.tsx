// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/index'
import { DataBuffer } from '../model/DataBuffer'
import { style } from './GridFrame.css'

export function GridFrame(p: {cellWidth: number, cellHeight: number, buffer: DataBuffer}): JSX.Element {
  return reactive(() => {
    const data = p.buffer.data
    const dim: React.CSSProperties = {
      overflow: 'hidden',
      boxSizing: 'border-box',
      borderBottom: '0.5px dashed rgba(127, 127, 127, 0.75)',
      borderRight: '0.5px dashed rgba(127, 127, 127, 0.75)',
      padding: '0 0.25em',
      width: `${p.cellWidth}px`,
      minWidth: `${p.cellWidth}px`,
      maxWidth: `${p.cellWidth}px`,
      height: `${p.cellHeight}px`,
      minHeight: `${p.cellHeight}px`,
      maxHeight: `${p.cellHeight}px`,
    }
    return (
      <React.Fragment>
        {data.map((line, row) => line.map((cell, col) => (
          // <GridCell row={row} col={col} text={cell} style={dim}/>
          <div title={cell} style={{...dim, gridRow: row + 1, gridColumn: col + 1}}>{cell}</div>
        )))}
      </React.Fragment>
    )
  })
}

export function GridCell(p: {row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
  return reactive(counter => {
    const blink = counter % 2 === 0 ? style.classes.blink1 : style.classes.blink2
    return (
      <div title={p.text} className={blink} style={{...p.style, gridRow: p.row + 1, gridColumn: p.col + 1}}>{p.text}</div>
    )
  })
}
