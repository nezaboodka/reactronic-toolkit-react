// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger, reentrance, Reentrance } from 'reactronic'
import { Viewport } from '../../source/index'

export class DataBuffer extends State {
  readonly viewport: Viewport
  private loadedData: string[][]

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.loadedData = []
  }

  get data(): string[][] {
    return this.loadedData
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    const vp = this.viewport
    const cells = vp.bufferingCells
    if (!cells.equalTo(vp.bufferedCells)) {
      const data: string[][] = []
      const till = cells.till
      for (let y = cells.y; y < till.y; y++) {
        const row: string[] = []
        for (let x = cells.x; x < till.x; x++)
          row.push(`Cell r${y}c${x}`)
        data.push(row)
      }
      await sleep(50)
      this.loadedData = data
      this.viewport.bufferedCells = cells
    }
  }
}
