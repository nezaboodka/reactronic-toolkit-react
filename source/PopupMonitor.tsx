// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, stateless, action, Action } from 'reactronic'
import { OutsideEvent } from './OutsideEvent'

export class PopupMonitor extends State {
  @stateless readonly outsideEvent: OutsideEvent
  private activated: boolean = false

  constructor(event: string) {
    super()
    this.outsideEvent = new OutsideEvent(event)
  }

  static create(event: string): PopupMonitor {
    return Action.run('PopupMonitor.create', () => new PopupMonitor(event))
  }

  get isActive(): boolean { return this.activated }

  @action
  setActive(value: boolean): void {
    if (value != this.activated) {
      this.outsideEvent.onOutside = value ? this.onOutside : undefined
      this.activated = value
    }
  }

  @action
  private onOutside(e: Event): void {
    this.setActive(false)
  }
}
