// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger, reentrance, Reentrance } from 'reactronic'
import { Viewport, Area } from '../../source/index'

export class DataBuffer extends State {
  readonly viewport: Viewport
  private loadedData: string[][]
  private loadedArea: Area

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.loadedData = []
    this.loadedArea = Area.ZERO
  }

  get data(): string[][] {
    return this.loadedData
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    const area = this.viewport.bufferCells
    if (!area.equalTo(this.loadedArea)) {
      const data: string[][] = []
      const till = area.till
      for (let y = area.y; y < till.y; y++) {
        const row: string[] = []
        for (let x = area.x; x < till.x; x++)
          row.push(`Cell r${y}c${x}`)
        data.push(row)
      }
      await sleep(300)
      this.loadedData = data
      this.loadedArea = area
    }
  }
}
