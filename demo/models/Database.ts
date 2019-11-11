// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, sleep, trigger, cachedArgs } from 'reactronic'
import { Viewport, Area } from '../../source/index'

export class Database extends State {
  @trigger @cachedArgs(true)
  async data(viewport?: Viewport): Promise<string[][]> {
    const cells = viewport ? viewport.bufferCells : Area.ZERO
    const result: string[][] = []
    const till = cells.till
    for (let y = cells.y; y < till.y; y++) {
      const row: string[] = []
      for (let x = cells.x; x < till.x; x++)
        row.push(`Cell r${y}c${x}`)
      result.push(row)
    }
    await sleep(50)
    return result
  }
}
