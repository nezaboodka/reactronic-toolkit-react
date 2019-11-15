// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State } from 'reactronic'

import { GridViewport } from '@reactronic-toolkit-react'
import { DataLoader } from '~m/DataLoader'

export class Application extends State {
  readonly viewport = new GridViewport(10000, 1000000000000)
  readonly loader = new DataLoader(this.viewport)
}
