// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { cached, Reentrance, reentrance, sleep, Stateful, trigger } from 'reactronic'

import { Area, VirtualGrid, xy } from '~/../source/reactronic-toolkit-react'

export class GridFragmentLoader extends Stateful {
  readonly grid: VirtualGrid
  private loadedData: string[] = []
  shownData: string[] = []
  shownCells: Area = Area.ZERO

  constructor(grid: VirtualGrid) {
    super()
    this.grid = grid
  }

  get readyArea(): Area {
    const g = this.grid
    return this.shownCells.scaleBy(g.ppc).relativeTo(g.surfaceArea)
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  protected async load(): Promise<void> {
    const g = this.grid
    const buffer = g.bufferCells
    if (!buffer.equalTo(g.loadedCells)) {
      const data: string[] = []
      const till = buffer.till
      for (let y = buffer.y; y <= till.y; y++)
        for (let x = buffer.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      this.loadedData = data
      g.loaded(buffer)
    }
    await sleep(50)
  }

  @trigger
  protected show(): void {
    const loaded = this.grid.loadedCells
    if (loaded.equalTo(this.grid.readyCells)) {
      this.shownData = this.loadedData.slice() // clone
      this.shownCells = loaded
    }
  }

  @cached
  jsx(cls?: string): JSX.Element[] {
    // console.log(`cls: ${cls}`)
    const cells = this.shownCells
    const data = this.shownData
    const grid = this.grid
    const spot = grid.spot
    const zero = xy(cells.x - spot.x, cells.y - spot.y)
    return data.map((cell, i) => {
      const y = Math.floor(i / cells.size.x) + cells.y
      const x = i % cells.size.x + cells.x
      const r = zero.y + y - cells.y
      const c = zero.x + x - cells.x
      const key = `R${r}C${c}:Y${y}X${x}`
      return (
        // <GridCell key={key} hint={`${key} - ${cell}`}
        //   style={{width: `${g.ppcX}px`, height: `${g.ppcY}px`}}
        //   row={r} col={c} text={cell}/>
        <div key={key} title={key} className={cls}
          style={{
            width: `${grid.ppcX}px`,
            height: `${grid.ppcY}px`,
            gridRow: r + 1,
            gridColumn: c + 1}}>
          {cell}
        </div>
      )
    })
  }

  @cached
  html(cls?: string): string {
    const grid = this.grid
    const cells = this.shownCells
    const data = this.shownData
    const spot = this.grid.spot
    const zero = xy(cells.x - spot.x, cells.y - spot.y)
    return data.map((cell, i) => {
      const y = Math.floor(i / cells.size.x) + cells.y
      const x = i % cells.size.x + cells.x
      const r = zero.y + y - cells.y
      const c = zero.x + x - cells.x
      const key = `R${r}C${c}:Y${y}X${x}`
      return `
        <div title="${key}" class="${cls}" style="width: ${grid.ppcX}px; height: ${grid.ppcY}px; grid-row: ${r + 1}; grid-column: ${c + 1};">
          ${cell}
        </div>
      `
    }).join('\n\n')
  }
}
