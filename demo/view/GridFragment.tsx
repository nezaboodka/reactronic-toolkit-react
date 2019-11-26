// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'

import { reactive, spot } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'

import { style } from './GridFragment.css'

export function GridFragment(p: {
  loader: GridFragmentLoader,
  className?: string}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const grid = p.loader.grid
    const area = p.loader.shownArea
    // console.log(`fragment: ${fragment.x} x ${fragment.y} (${fragment.size.x} x ${fragment.size.y}), remake: ${p.loader.grid.readyRemake}, cycle: ${cycle} - ${window.rWhy}`)
    return (
      <div className={cx(p.className)}
        style={spot(area.size.x, area.size.y, area.x, area.y)}>
        <div style={{position: 'fixed', left: '4em', top:'6em', color: 'lightgreen', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100}}>
          spot {grid.spotId}, cycle {cycle}<br/>{window.rWhy}
        </div>
        {p.loader.jsx(cx(css.cell, css.blink1))}
      </div>
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
    <div title={`${p.hint}`} className={cx(css.cell, css.blink1)} style={place}>
      {p.text}
    </div>
  )
}
