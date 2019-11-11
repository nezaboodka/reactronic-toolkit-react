// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, cached, sleep } from 'reactronic'
import { Viewport } from '../../source/index'

export class Database extends State {
  @cached
  async data(viewport: Viewport): Promise<string[][]> {
    const cells = viewport.bufferCells
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
