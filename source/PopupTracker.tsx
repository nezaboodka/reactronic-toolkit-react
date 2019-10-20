// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { State, stateless, action, Action } from 'reactronic'

export class PopupTracker extends State {
  isActive: boolean = false
  @stateless readonly info: PopupTrackerInfo

  constructor(event: string) {
    super()
    this.info = new PopupTrackerInfo(event)
  }

  static create(event: string): PopupTracker {
    return Action.run('Popup.create', () => new PopupTracker(event))
  }

  useMemberRef(focus: boolean = false): (...args: any[]) => any {
    const ref = React.useCallback(element => {
      this.use(ref, element)
      if (focus)
        this.info.focus = element
    }, [])
    return ref
  }

  @action
  setActive(value: boolean): void {
    if (this.isActive !== value) {
      this.isActive = value
      if (value) { // start tracking
        document.addEventListener(this.info.event, this.capture, true)
        document.addEventListener(this.info.event, this.handle, false)
        if (this.info.focus)
          this.info.focus.focus()
      }
      else { // stop tracking
        document.removeEventListener(this.info.event, this.capture, true)
        document.removeEventListener(this.info.event, this.handle, false)
      }
    }
  }

  // Internal

  @action
  private use(key: any, m: EventTarget | null): void {
    if (m !== null) {
      this.info.refs.set(key, m)
      this.info.members.add(m)
      m.addEventListener(this.info.event, this.capture, true)
    }
    else {
      const m = this.info.refs.get(key)
      if (m) {
        m.removeEventListener(this.info.event, this.capture, true)
        this.info.members.delete(m)
        this.info.refs.delete(key)
      }
    }
  }

  @action // just to perform binding
  private capture(e: Event): void {
    if (e.currentTarget && this.info.members.has(e.currentTarget))
      this.info.memberEvent = e
  }

  @action // just to perform binding
  private handle(e: Event): void {
    if (this.info.memberEvent !== e)
      this.setActive(false)
    this.info.memberEvent = null
  }
}

class PopupTrackerInfo {
  constructor(readonly event: string) { }
  refs = new Map<any, EventTarget>()
  members = new Set<EventTarget>()
  focus: HTMLElement | null = null
  memberEvent: Event | null = null
}
