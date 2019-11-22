// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, xy } from '~/../source/reactronic-toolkit-react'
import { DataLoader } from '~/app/DataLoader'

import { style } from './GridFragment.css'

export function GridFragment(p: {loader: DataLoader}): JSX.Element {
  // const start = performance.now()
  const result = reactive(() => {
    const data = p.loader.data
    const g = p.loader.grid
    const tg = g.targetGrid
    const fragment = g.readyCells
    const zero = xy(fragment.x - tg.x, fragment.y - tg.y)
    const dim: React.CSSProperties = {
      width: `${g.ppc.x}px`,
      height: `${g.ppc.y}px`,
    }
    return (
      <React.Fragment>
        {fragment.overlaps(g.viewportCells) && data.map((cell, i) => {
          const y = Math.floor(i / fragment.size.x)
          const x = i % fragment.size.x
          const r = zero.y + y
          const c = zero.x + x
          const key = `R${r}C${c}:Y${fragment.y + y}X${fragment.x + x}`
          return (
            <GridCell key={key} hint={key} style={dim}
              row={r} col={c} text={cell}/>
          )
        })}
      </React.Fragment>
    )
  })
  // console.log(`Render in ${performance.now() - start}`)
  return result
}

function GridCell(p: {hint: string, row: number, col: number, text: string, style?: React.CSSProperties}): JSX.Element {
  const css = style.classes
  const place: React.CSSProperties = {
    ...p.style,
    gridRow: p.row + 1,
    gridColumn: p.col + 1,
  }
  return (
    <div title={`${p.hint}`} className={cx(css.cell, css.rollout)} style={place}>
      {p.text}
    </div>
  )
}
