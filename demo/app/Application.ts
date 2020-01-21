// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Stateful } from 'reactronic'

import { VirtualGrid } from '~/../source/reactronic-toolkit-react'
import { GridFragmentLoader } from '~/app/GridFragmentLoader'

export class Application extends Stateful {
  readonly grid = new VirtualGrid(10000, 1_000_000_000_000) // 1bn
  readonly loader = new GridFragmentLoader(this.grid)
}
