// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State } from 'reactronic'

import { VirtualProjector } from '@reactronic-toolkit-react'
import { DataBuffer } from '~/model/DataBuffer'

export class Application extends State {
  readonly projector = new VirtualProjector(10000, 1000000000000)
  readonly buffer = new DataBuffer(this.projector)
}
