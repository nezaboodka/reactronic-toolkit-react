// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, spot } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'
import { style } from '~/view/GridFragment.css'
import { div } from '~/viewtronic/html'

export function GridFragment(loader: GridFragmentLoader, className?: string): void {
  const css = style.classes
  const grid = loader.grid
  const area = loader.readyArea
  // console.log(`id: ${grid.spotId}, cycle=${cycle}, why: ${window.rWhy}`)
  div('fragment', e => {
    e.className = cx(className)
    // e.style={spot(area.size.x, area.size.y, area.x, area.y)}
    // <div style={{position: 'fixed', left: '4em', top:'6em', color: cycle === 0 ? 'white' : 'lightgreen', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>
    //   spot {grid.spotId}, cycle {cycle}<br/>{window.rWhy}
    // </div>
    // {p.loader.jsx(cx(css.cell, css.rollout))}
  })
  // }, {hint: `<${GridFragment.name}>`, priority: 9})
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
