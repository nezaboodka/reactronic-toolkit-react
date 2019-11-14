// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State } from 'reactronic'

import { GridTelescope } from '@reactronic-toolkit-react'
import { DataBuffer } from '/m/DataBuffer'

export class Application extends State {
  readonly telescope = new GridTelescope(10000, 1000000000000)
  readonly buffer = new DataBuffer(this.telescope)
}
