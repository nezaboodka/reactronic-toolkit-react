// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State } from 'reactronic'
import { Viewport } from '../../source/index'
import { DataBuffer } from './DataBuffer'

export class Application extends State {
  readonly viewport = new Viewport(10000, 1000000000000)
  readonly buffer = new DataBuffer(this.viewport)
}