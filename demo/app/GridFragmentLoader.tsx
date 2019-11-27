// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { cached, Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { Area, VirtualGrid, xy } from '~/../source/reactronic-toolkit-react'

export class GridFragmentLoader extends State {
  constructor(
    readonly grid: VirtualGrid,
    private loadedData: string[] = [],
    public shownData: string[] = [],
    public shownCells: Area = Area.ZERO) {
    super()
  }

  get shownArea(): Area {
    const g = this.grid
    return this.shownCells.scaleBy(g.ppc).relativeTo(g.surfaceArea)
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

  @trigger @reentrance(Reentrance.CancelPrevious)
  protected async load(): Promise<void> {
    const g = this.grid
    const buffer = g.bufferCells
    if (!buffer.equalTo(g.readyCells)) {
      const data: string[] = []
      const till = buffer.till
      for (let y = buffer.y; y <= till.y; y++)
        for (let x = buffer.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      this.loadedData = data
      g.ready(buffer)
    }
    await sleep(50)
  }

  @trigger
  protected show(): void {
    if (this.grid.readyCells.overlaps(this.grid.viewportCells) &&
      !this.shownCells.equalTo(this.grid.readyCells)) {
      if (!this.shownCells.overlaps(this.grid.readyCells))
        this.grid.spotId++
      this.shownData = this.loadedData.slice()
      this.shownCells = this.grid.readyCells
    }
  }
}
