// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, stateless, action, Action } from 'reactronic'

export class EventTargetGroup extends State {
  isActive: boolean = false;
  @stateless private members = new Set<EventTarget>()
  @stateless private keepActive: Event | null = null

  @action
  setActive(value: boolean): void {
    if (this.isActive !== value) {
      this.isActive = value
      if (!value) {
        this.members.forEach(m => {
          m.removeEventListener('pointerdown', this.pointerDownCapture, true)
          m.removeEventListener('pointerdown', this.pointerDownBubble, false)
        })
        document.removeEventListener('pointerdown', this.pointerDownCapture, true)
        document.removeEventListener('pointerdown', this.pointerDownBubble, false)
        this.members.clear()
      }
      else {
        document.addEventListener('pointerdown', this.pointerDownCapture, true)
        document.addEventListener('pointerdown', this.pointerDownBubble, false)
      }
    }
  }

  @action
  include(member: EventTarget | null): void {
    if (member !== null) {
      this.members.add(member)
      member.addEventListener('pointerdown', this.pointerDownCapture, true)
      member.addEventListener('pointerdown', this.pointerDownBubble, false)
    }
  }

  @action // just to perform binding
  private pointerDownCapture(e: Event): void {
    if (e.currentTarget && this.members.has(e.currentTarget))
      this.keepActive = e
  }

  @action // just to perform binding
  private pointerDownBubble(e: Event): void {
    if (this.keepActive !== e)
      this.setActive(false)
  }

  static create(): EventTargetGroup {
    return Action.run('ActiveGroup.create', () => new EventTargetGroup())
  }
}
