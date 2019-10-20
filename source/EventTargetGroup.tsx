// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { State, stateless, action, Action } from 'reactronic'

export class EventTargetGroup extends State {
  isActive: boolean = false;
  @stateless readonly event: string
  @stateless private refs = new Map<any, EventTarget>()
  @stateless private members = new Set<EventTarget>()
  @stateless private inside: Event | null = null

  constructor(event: string) {
    super()
    this.event = event
  }

  static create(event: string): EventTargetGroup {
    return Action.run('EventTargetGroup.create', () => new EventTargetGroup(event))
  }

  useMemberRef(): (...args: any[]) => any {
    const ref = React.useCallback(element => {
      this.use(ref, element)
    }, [])
    return ref
  }

  @action
  setActive(value: boolean): void {
    if (this.isActive !== value) {
      this.isActive = value
      if (value) { // start tracking
        document.addEventListener(this.event, this.capture, true)
        document.addEventListener(this.event, this.handle, false)
      }
      else { // stop tracking
        document.removeEventListener(this.event, this.capture, true)
        document.removeEventListener(this.event, this.handle, false)
      }
    }
  }

  // Internal

  @action
  private use(key: any, m: EventTarget | null): void {
    if (m !== null) {
      this.refs.set(key, m)
      this.members.add(m)
      m.addEventListener(this.event, this.capture, true)
    }
    else {
      const m = this.refs.get(key)
      if (m) {
        m.removeEventListener(this.event, this.capture, true)
        this.members.delete(m)
        this.refs.delete(key)
      }
    }
  }

  @action // just to perform binding
  private capture(e: Event): void {
    if (e.currentTarget && this.members.has(e.currentTarget))
      this.inside = e
  }

  @action // just to perform binding
  private handle(e: Event): void {
    if (this.inside !== e)
      this.setActive(false)
    this.inside = null
  }
}
