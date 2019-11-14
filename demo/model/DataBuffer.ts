// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Reentrance,reentrance, sleep, State, trigger } from 'reactronic'

import { Projector } from '@reactronic-toolkit-react'

export class DataBuffer extends State {
  readonly projector: Projector
  data: string[]

  constructor(projector: Projector) {
    super()
    this.projector = projector
    this.data = []
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    const vp = this.projector
    const buf = vp.bufferCells
    if (!buf.equalTo(vp.loadedCells)) {
      const data: string[] = []
      const till = buf.till
      for (let y = buf.y; y <= till.y; y++)
        for (let x = buf.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      await sleep(130)
      this.data = data
      vp.confirmLoadedCells(buf)
    }
  }
}
