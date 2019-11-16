// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Reentrance, reentrance, sleep, State, trigger } from 'reactronic'

import { Viewport } from '@reactronic-toolkit-react'

export class DataLoader extends State {
  readonly viewport: Viewport
  data: string[]

  constructor(viewport: Viewport) {
    super()
    this.viewport = viewport
    this.data = []
  }

  @trigger @reentrance(Reentrance.RunSideBySide)
  async load(): Promise<void> {
    await sleep(50)
    const vp = this.viewport
    const buf = vp.bufferCells
    if (!buf.equalTo(vp.loadedCells)) {
      const data: string[] = []
      const till = buf.till
      for (let y = buf.y; y <= till.y; y++)
        for (let x = buf.x; x <= till.x; x++)
          data.push(`${y}:${x}`)
      this.data = data
      vp.ready(buf)
    }
  }
}
