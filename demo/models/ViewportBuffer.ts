// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger } from 'reactronic'
import { Viewport, Area } from '../../source/index'

export class ViewportBuffer extends State {
  readonly viewport: Viewport
  data: string[][]
  area: Area

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.data = []
    this.area = Area.ZERO
  }

  @trigger
  async load(): Promise<void> {
    const area = this.viewport.bufferCells
    if (!area.equalTo(this.area)) {
      const data: string[][] = []
      const till = area.till
      for (let y = area.y; y < till.y; y++) {
        const row: string[] = []
        for (let x = area.x; x < till.x; x++)
          row.push(`Cell r${y}c${x}`)
        data.push(row)
      }
      await sleep(50)
      this.data = data
      this.area = area
    }
  }
}
