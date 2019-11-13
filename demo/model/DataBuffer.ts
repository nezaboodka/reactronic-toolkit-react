// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger, reentrance, Reentrance } from 'reactronic'
import { Viewport } from '../../source/index'

export class DataBuffer extends State {
  readonly viewport: Viewport
  data: string[]

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.data = []
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    const vp = this.viewport
    const t = vp.bufferCells
    if (!t.equalTo(vp.loadedCells)) {
      const data: string[] = []
      const till = t.till
      for (let y = t.y; y <= till.y; y++)
        for (let x = t.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      await sleep(50)
      this.data = data
      vp.loadedCells = t
      if (!vp.grid.envelops(t))
        vp.grid = vp.grid.moveCenterTo(t.center, vp.allCells).round()
    }
  }
}
