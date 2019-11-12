// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'

export class GroupEvents {
  private events: string[]
  private keys = new Map<any, EventTarget>()
  private participants = new Set<EventTarget>()
  private participantEvent: Event | null = null
  private inside?: (e: Event) => void = undefined
  private outside?: (e: Event) => void = undefined

  constructor(events: string[]) {
    this.events = events
  }

  get onInside(): ((e: Event) => void) | undefined { return this.inside }
  set onInside(handler: ((e: Event) => void) | undefined) {
    if (this.inside !== handler) {
      if (this.inside !== undefined) {
        for (const x of this.events) {
          document.removeEventListener(x, this.bubble, false)
          document.removeEventListener(x, this.capture, true)
        }
      }
      this.inside = handler
      if (handler !== undefined) {
        for (const x of this.events) {
          document.addEventListener(x, this.capture, true)
          document.addEventListener(x, this.bubble, false)
        }
      }
    }
  }

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
      this.keys.set(key, element)
      this.participants.add(element)
      for (const x of this.events)
        element.addEventListener(x, this.capture, true)
    }
    else {
      const old = this.keys.get(key)
      if (old) {
        for (const x of this.events)
          old.removeEventListener(x, this.capture, true)
        this.participants.delete(old)
        this.keys.delete(key)
      }
    }
  }

  // Internal

  private capture = (e: Event): void => {
    if (e.currentTarget && this.participants.has(e.currentTarget))
      this.participantEvent = e
  }

  private bubble = (e: Event): void => {
    if (this.participantEvent === e) {
      if (this.inside)
        this.inside(e)
    }
    else if (this.outside)
      this.outside(e)
    this.participantEvent = null
  }
}
