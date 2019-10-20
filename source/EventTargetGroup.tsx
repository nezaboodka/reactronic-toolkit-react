// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, stateless, action, Action } from 'reactronic'

export class EventTargetGroup extends State {
  constructor(readonly event: string) { super() }
  isActive: boolean = false;
  @stateless private members = new Set<EventTarget>()
  @stateless private keepActive: Event | null = null

  @action
  setActive(value: boolean): void {
    if (this.isActive !== value) {
      this.isActive = value
      if (!value) {
        this.members.forEach(m =>
          m.removeEventListener(this.event, this.capture, true))
        document.removeEventListener(this.event, this.capture, true)
        document.removeEventListener(this.event, this.handle, false)
        this.members.clear()
      }
      else {
        document.addEventListener(this.event, this.capture, true)
        document.addEventListener(this.event, this.handle, false)
      }
    }
  }

  @action
  includeMember(m: EventTarget | null): void {
    if (m !== null) {
      this.members.add(m)
      m.addEventListener(this.event, this.capture, true)
    }
  }

  @action // just to perform binding
  private capture(e: Event): void {
    if (e.currentTarget && this.members.has(e.currentTarget))
      this.keepActive = e
  }

  @action // just to perform binding
  private handle(e: Event): void {
    if (this.keepActive !== e)
      this.setActive(false)
    this.keepActive = null
  }

  static create(event: string): EventTargetGroup {
    return Action.run('EventTargetGroup.create', () => new EventTargetGroup(event))
  }
}
