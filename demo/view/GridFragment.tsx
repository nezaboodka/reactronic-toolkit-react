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

export function GridFragment(p: {
  loader: GridFragmentLoader,
  className?: string}): JSX.Element {
  return reactive(cycle => {
    const css = style.classes
    const vg = p.loader.grid
    const ra = vg.readyArea.relativeTo(xy(vg.surfaceX, vg.surfaceY))
    const fragment = p.loader.shownCells
    const data = p.loader.shown
    const tg = p.loader.grid.placeholder
    const zero = xy(fragment.x - tg.x, fragment.y - tg.y)
    // const html = data.map((cell, i) => {
    //   const y = Math.floor(i / fragment.size.x) + fragment.y
    //   const x = i % fragment.size.x + fragment.x
    //   const r = zero.y + y - fragment.y
    //   const c = zero.x + x - fragment.x
    //   const key = `R${r}C${c}:Y${y}X${x}`
    //   return `
    //     <div class="${cx(css.cell)}" style="width: ${vg.ppcX}px; height: ${vg.ppcY}px; grid-row: ${r + 1}; grid-column: ${c + 1};">
    //       ${cell}
    //     </div>
    //   `
    // }).join('\n\n')
    // console.log(`fragment: ${fragment.x} x ${fragment.y} (${fragment.size.x} x ${fragment.size.y}), remake: ${p.loader.grid.readyRemake}, cycle: ${cycle} - ${window.rWhy}`)
    return (
      <div className={cx(p.className)}
        style={place(ra.size.x, ra.size.y, ra.x, ra.y)}
        /*dangerouslySetInnerHTML={{__html: html}}*/>
        {data.map((cell, i) => {
          const y = Math.floor(i / fragment.size.x) + fragment.y
          const x = i % fragment.size.x + fragment.x
          const r = zero.y + y - fragment.y
          const c = zero.x + x - fragment.x
          const key = `R${r}C${c}:Y${y}X${x}`
          return (
            // <GridCell key={key} hint={`${key} - ${cell}`} style={dim}
            //   row={r} col={c} text={cell}/>
            <div className={cx(css.cell)}
              style={{
                width: `${vg.ppcX}px`,
                height: `${vg.ppcY}px`,
                gridRow: r + 1,
                gridColumn: c + 1}}>
              {cell}
            </div>
          )
        })}
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

function place(sizeX: number, sizeY: number, posX?: number, posY?: number): React.CSSProperties {
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
