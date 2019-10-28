// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, cached, cachedArgs, sleep } from 'reactronic'
import { Area } from '../../source/index'

export class Database extends State {
  @cached @cachedArgs(true)
  async data(cells: Area): Promise<string[][]> {
    const result: string[][] = []
    const till = cells.till
    for (let y = cells.y; y < till.y; y++) {
      const row: string[] = []
      for (let x = cells.x; x < till.x; x++)
        row.push(`Cell r${y}c${x}`)
      result.push(row)
    }
    await sleep(0)
    return result
  }
}
