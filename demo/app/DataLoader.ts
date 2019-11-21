// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { VirtualScroll } from '#reactronic-toolkit-react'

export class DataLoader extends State {
  constructor(
    readonly scroll: VirtualScroll,
    public data: string[] = []) {
    super()
  }

  @trigger @reentrance(Reentrance.CancelPrevious)
  async load(): Promise<void> {
    await sleep(0)
    const vs = this.scroll
    const buffer = vs.bufferCells
    if (!buffer.equalTo(vs.readyCells)) {
      const data: string[] = []
      const till = buffer.till
      for (let y = buffer.y; y <= till.y; y++)
        for (let x = buffer.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      this.data = data
      vs.setReadyCells(buffer)
    }
  }
}
