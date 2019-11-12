// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger, reentrance, Reentrance } from 'reactronic'
import { Viewport, Area } from '../../source/index'

export class ViewportBuffer extends State {
  readonly viewport: Viewport
  private loaded: string[][]
  area: Area

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.loaded = []
    this.area = Area.ZERO
  }

  get data(): string[][] {
    return this.loaded
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    const area = this.viewport.bufferCells
    if (!area.equalTo(this.area)) {
      console.log(`loading ${area.y}+${area.size.y}`)
      const data: string[][] = []
      const till = area.till
      for (let y = area.y; y < till.y; y++) {
        const row: string[] = []
        for (let x = area.x; x < till.x; x++)
          row.push(`Cell r${y}c${x}`)
        data.push(row)
      }
      await sleep(300)
      this.loaded = data
      this.area = area
      console.log(`loaded ${area.y}+${area.size.y}`)
    }
  }
}
