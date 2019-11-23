// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { VirtualGrid } from '~/../source/reactronic-toolkit-react'

export class DataLoader extends State {
  constructor(
    readonly grid: VirtualGrid,
    private loaded: string[] = [],
    public shown: string[] = [],
    public jump: number = 0) {
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
      this.loaded = data
      g.ready(buffer)
    }
    await sleep(50)
  }

  @trigger apply(): void {
    if (this.grid.readyCells.overlaps(this.grid.viewportCells)) {
      this.shown = this.loaded
      this.jump++
    }
  }
}
