// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Action, action, Stateful } from 'reactronic'

export class Model extends Stateful {
  x: number = 0
  y: number = 0
  clicks: number = 0
  size: number = 0

  @action
  move(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  @action
  click(): void {
    this.clicks++
  }

  @action
  setSize(value: number): void {
    this.size = value
  }
}

export const model = Action.run('init', () => new Model())