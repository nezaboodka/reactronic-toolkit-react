// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State } from 'reactronic'

import { VirtualGrid } from '~/../source/reactronic-toolkit-react'
import { DataLoader } from '~/app/DataLoader'

export class Application extends State {
  readonly grid = new VirtualGrid(10000, 1_000_000_000_000) // 1bn
  readonly loader = new DataLoader(this.grid)
}
