// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'
import { TraceLevel } from 'reactronic'

import { reactive, xy } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'

import { style } from './GridFragment.css'

export function GridFragment(p: {loader: GridFragmentLoader}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const fragment = p.loader.shownCells
    const data = p.loader.shown
    const tg = p.loader.grid.targetGrid
    const zero = xy(fragment.x - tg.x, fragment.y - tg.y)
    const dim: React.CSSProperties = {
      width: `${p.loader.grid.ppcX}px`,
      height: `${p.loader.grid.ppcY}px`,
    }
    console.log(`fragment: ${fragment.x} x ${fragment.y} (${fragment.size.x} x ${fragment.size.y}), remake: ${p.loader.grid.readyRemake}, cycle: ${cycle} - ${window.rWhy}`)
    return (
      <React.Fragment>
        {data.map((cell, i) => {
          const y = Math.floor(i / fragment.size.x) + fragment.y
          const x = i % fragment.size.x + fragment.x
          const r = zero.y + y - fragment.y
          const c = zero.x + x - fragment.x
          const key = `R${r}C${c}:Y${y}X${x}`
          return (
            <GridCell key={key} hint={`${key} - ${cell}`} style={dim}
              row={r} col={c} text={cell}/>
            // <div key={key} title={`${key}`} className={cx(css.cell)} style={{...dim, gridRow: r + 1, gridColumn: c + 1}}>
            //   {cell}
            // </div>
          )
        })}
      </React.Fragment>
    )
  }, `<${GridFragment.name}>`)
}

function GridCell(p: {hint: string, row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
  const css = style.classes
  const place: React.CSSProperties = {
    ...p.style,
    gridRow: p.row + 1,
    gridColumn: p.col + 1,
  }
  return (
    <div title={`${p.hint}`} className={cx(css.cell)} style={place}>
      {p.text}
    </div>
  )
}
