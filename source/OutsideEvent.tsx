// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

export class OutsideEvent {
  constructor(private event: string) { }
  private refs = new Map<any, EventTarget>()
  private members = new Set<EventTarget>()
  private memberEvent: Event | null = null
  private outside?: (e: Event) => void = undefined

  get onOutside(): ((e: Event) => void) | undefined { return this.outside }
  set onOutside(handler: ((e: Event) => void) | undefined) {
    if (this.outside !== handler) {
      if (this.outside !== undefined) {
        document.removeEventListener(this.event, this.bubble, false)
        document.removeEventListener(this.event, this.capture, true)
      }
      this.outside = handler
      if (handler !== undefined) {
        document.addEventListener(this.event, this.capture, true)
        document.addEventListener(this.event, this.bubble, false)
      }
    }
  }

  useMemberCallback(): (...args: any[]) => any {
    const ref = React.useCallback(element => {
      this.member(ref, element)
    }, [])
    return ref
  }

  member(key: any, member: EventTarget | null): void {
    if (member !== null) {
      this.refs.set(key, member)
      this.members.add(member)
      member.addEventListener(this.event, this.capture, true)
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

  // Internal

  private capture = (e: Event): void => {
    if (e.currentTarget && this.members.has(e.currentTarget))
      this.memberEvent = e
  }

  private bubble = (e: Event): void => {
    if (this.memberEvent !== e && this.outside)
      this.outside(e)
    this.memberEvent = null
  }
}
