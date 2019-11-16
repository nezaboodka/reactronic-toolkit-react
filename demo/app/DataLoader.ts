// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { Viewport } from '@reactronic-toolkit-react'

export class DataLoader extends State {
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
    const buf = vp.bufferCells
    if (!buf.equalTo(vp.loadedCells)) {
      const data: string[] = []
      const till = buf.till
      for (let y = buf.y; y <= till.y; y++)
        for (let x = buf.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      await sleep(130)
      if (!Action.current.isCanceled) {
        this.data = data
        vp.ready(buf)
      }
    }
  }
}
