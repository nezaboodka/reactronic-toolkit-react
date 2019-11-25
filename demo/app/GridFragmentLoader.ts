// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { Area, VirtualGrid } from '~/../source/reactronic-toolkit-react'

export class GridFragmentLoader extends State {
  constructor(
    readonly grid: VirtualGrid,
    private loadedData: string[] = [],
    public shownData: string[] = [],
    public shownCells: Area = Area.ZERO) {
    super()
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
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
  show(): void {
    if (this.grid.readyCells.overlaps(this.grid.viewportCells) &&
      !this.shownCells.equalTo(this.grid.readyCells)) {
      if (!this.shownCells.overlaps(this.grid.readyCells))
        this.grid.renovation++
      this.shownData = this.loadedData.slice()
      this.shownCells = this.grid.readyCells
    }
  }
}
