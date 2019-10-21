// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

export class OutsideEvents {
  constructor(private events: string[]) { }
  private refs = new Map<any, EventTarget>()
  private participants = new Set<EventTarget>()
  private participantEvent: Event | null = null
  private outside?: (e: Event) => void = undefined

  get onOutside(): ((e: Event) => void) | undefined { return this.outside }
  set onOutside(handler: ((e: Event) => void) | undefined) {
    if (this.outside !== handler) {
      if (this.outside !== undefined) {
        for (const x of this.events) {
          document.removeEventListener(x, this.bubble, false)
          document.removeEventListener(x, this.capture, true)
        }
      }
      this.outside = handler
      if (handler !== undefined) {
        for (const x of this.events) {
          document.addEventListener(x, this.capture, true)
          document.addEventListener(x, this.bubble, false)
        }
      }
    }
  }

  useCallbackToParticipate(): (...args: any[]) => any {
    const ref = React.useCallback(element => {
      this.participate(ref, element)
    }, [])
    return ref
  }

  participate(key: any, element: EventTarget | null): void {
    if (element !== null) {
      this.refs.set(key, element)
      this.participants.add(element)
      for (const x of this.events)
        element.addEventListener(x, this.capture, true)
    }
    else {
      const old = this.refs.get(key)
      if (old) {
        for (const x of this.events)
          old.removeEventListener(x, this.capture, true)
        this.participants.delete(old)
        this.refs.delete(key)
      }
    }
  }

  // Internal

  private capture = (e: Event): void => {
    if (e.currentTarget && this.participants.has(e.currentTarget))
      this.participantEvent = e
  }

  private bubble = (e: Event): void => {
    if (this.participantEvent !== e && this.outside)
      this.outside(e)
    this.participantEvent = null
  }
}
