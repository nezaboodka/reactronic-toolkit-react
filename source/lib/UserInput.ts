// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Stateful } from 'reactronic'

export enum KeyboardModifiers {
    None = 0,
    Control = 1,
    Shift = 2,
    Alt = 4,
    CtrlShift = 1 + 2,
    CtrlAlt = 1 + 4,
    CtrlShiftAlt = 1 + 2 + 4,
    ShiftAlt = 2 + 4,
}

export enum PointerButton {
    None = 0,
    Left = 1,
    Right = 2,
    Middle = 4,
}

export enum UserOperation {
    None = 0,
    Touch = 1,
    Click = 2,
    Scroll = 3,
    Zoom = 4,
    Drag = 5,
    Drop = 6,
}

export class UserInput extends Stateful {
    // Configuration
    draggingThreshold: number
    element?: HTMLElement | null
    // Common
    active: boolean
    touched: boolean
    captured: boolean
    // Keyboard
    keyDown: string
    modifiers: KeyboardModifiers
    // Pointer
    x: number
    y: number
    previousX: number
    previousY: number
    scrollDeltaX: number
    scrollDeltaY: number
    pointerButtonDown: PointerButton
    // Dragging
    dragging: boolean
    draggingStartX: number
    draggingStartY: number
    draggingStartModifiers: KeyboardModifiers
    // Result
    resultKey: string
    resultModifiers: KeyboardModifiers
    resultPointerButton: PointerButton
    resultOperation: UserOperation

    constructor() {
      super()
      // Configuration
      this.draggingThreshold = 4
      this.element = undefined
      // Common
      this.active = false
      this.touched = false
      this.captured = false
      // Keyboard
      this.keyDown = ''
      this.modifiers = KeyboardModifiers.None
      // Pointer
      this.x = 0
      this.y = 0
      this.previousX = 0
      this.previousY = 0
      this.scrollDeltaX = 0
      this.scrollDeltaY = 0
      this.pointerButtonDown = PointerButton.None
      // Dragging
      this.dragging = false
      this.draggingStartX = 0
      this.draggingStartY = 0
      this.draggingStartModifiers = KeyboardModifiers.None
      // Result
      this.resultKey = ''
      this.resultModifiers = KeyboardModifiers.None
      this.resultPointerButton = PointerButton.None
      this.resultOperation = UserOperation.None
    }

    @action
    setElement(element: HTMLElement | undefined, listen: boolean): void {
      const existing = this.element
      if (element !== existing) {
        if (existing) {
          existing.removeEventListener('blur', this.onBlur, false)
          existing.removeEventListener('pointerenter', this.onPointerEnter, false)
          existing.removeEventListener('pointerleave', this.onPointerLeave, false)
          existing.removeEventListener('pointerdown', this.onPointerDown, false)
          existing.removeEventListener('pointermove', this.onPointerMove, false)
          existing.removeEventListener('pointerup', this.onPointerUp, false)
          existing.removeEventListener('wheel', this.onWheel, false)
          existing.removeEventListener('keydown', this.onKeyDown, false)
          existing.removeEventListener('keyup', this.onKeyUp, false)
          existing.removeEventListener('touchstart', this.onTouchStart, false)
          existing.removeEventListener('touchend', this.onTouchEnd, false)
          existing.removeEventListener('blur', this.onBlur, false)
        }
        this.element = element
        if (element && listen) {
          element.addEventListener('blur', this.onBlur, false)
          element.addEventListener('pointerenter', this.onPointerEnter, false)
          element.addEventListener('pointerleave', this.onPointerLeave, false)
          element.addEventListener('pointerdown', this.onPointerDown, false)
          element.addEventListener('pointermove', this.onPointerMove, false)
          element.addEventListener('pointerup', this.onPointerUp, false)
          element.addEventListener('wheel', this.onWheel, false)
          element.addEventListener('keydown', this.onKeyDown, false)
          element.addEventListener('keyup', this.onKeyUp, false)
          element.addEventListener('touchstart', this.onTouchStart, false)
          element.addEventListener('touchend', this.onTouchEnd, false)
          element.addEventListener('blur', this.onBlur, false)
        }
      }
    }

    @action
    onBlur(e: FocusEvent): void {
      this.clearAll()
    }

    @action
    onPointerEnter(e: PointerEvent): void {
      this.updateButtonDown(e)
      this.updatePosition(e, true)
      this.clearResult()
      this.clearDraggingStart()
      this.active = true
    }

    @action
    onPointerLeave(e: PointerEvent): void {
      this.updateButtonDown(e)
      this.updatePosition(e)
      this.clearResult()
      this.clearDraggingStart()
      this.active = false
    }

    @action
    onPointerDown(e: PointerEvent): void {
      this.updateButtonDown(e)
      if (this.pointerButtonDown !== PointerButton.None) {
        if (this.element) {
          this.element.setPointerCapture(e.pointerId)
          this.captured = true
        }
        this.updatePosition(e, true)
        this.draggingStartX = e.offsetX
        this.draggingStartY = e.offsetY
        this.draggingStartModifiers = UserInput.extractModifierKeys(e)
      }
      else if (this.element)
        this.element.releasePointerCapture(e.pointerId)
      this.clearResult()
    }

    @action
    onPointerMove(e: PointerEvent): void {
      this.updatePosition(e)
      if (this.captured && this.pointerButtonDown !== PointerButton.None && this.pointerButtonDown === e.buttons) {
        if (!this.dragging &&
                (Math.abs(this.x - this.draggingStartX) > this.draggingThreshold ||
                    Math.abs(this.y - this.draggingStartY) > this.draggingThreshold)) {
          this.dragging = true
        }
        if (this.dragging)
          this.updateResult(UserOperation.Drag)
      }
      else {
        this.clearResult()
        this.clearDraggingStart()
      }
    }

    @action
    onPointerUp(e: PointerEvent): void {
      this.updatePosition(e)
      const clickOrDrop = this.captured &&
            this.pointerButtonDown !== PointerButton.None &&
            e.buttons === PointerButton.None
      if (clickOrDrop) {
        if (this.element) {
          this.element.releasePointerCapture(e.pointerId)
          this.captured = false
        }
        this.updateResult(this.dragging ? UserOperation.Drop : UserOperation.Click)
        this.dragging = false
        this.pointerButtonDown = PointerButton.None
      }
      e.preventDefault()
    }

    @action
    onWheel(e: WheelEvent): void {
      this.updatePosition(e)
      if (!this.dragging && this.pointerButtonDown === PointerButton.None) {
        this.scrollDeltaX = e.deltaX
        this.scrollDeltaY = e.deltaY
        this.updateResult(UserOperation.Scroll)
      }
      e.preventDefault()
    }

    @action
    onKeyDown(e: KeyboardEvent): void {
      this.keyDown = e.key
      if (e.key === 'Escape') {
        this.clearResult()
        this.dragging = false
        this.pointerButtonDown = PointerButton.None
      }
      else if (e.key === 'Control')
        this.modifiers = this.modifiers | KeyboardModifiers.Control
      else if (e.key === 'Shift')
        this.modifiers = this.modifiers | KeyboardModifiers.Shift
      else if (e.key === 'Alt')
        this.modifiers = this.modifiers | KeyboardModifiers.Alt
    }

    @action
    onKeyUp(e: KeyboardEvent): void {
      if (e.key === 'Control')
        this.modifiers = this.modifiers & ~KeyboardModifiers.Control
      else if (e.key === 'Shift')
        this.modifiers = this.modifiers & ~KeyboardModifiers.Shift
      else if (e.key === 'Alt')
        this.modifiers = this.modifiers & ~KeyboardModifiers.Alt
    }

    @action
    onTouchStart(e: Event): void {
      this.touched = true
    }

    @action
    onTouchEnd(e: Event): void {
      this.touched = false
    }

    @action
    clearResult(): void {
      this.scrollDeltaX = 0
      this.scrollDeltaY = 0
      this.resultKey = ''
      this.resultModifiers = KeyboardModifiers.None
      this.resultPointerButton = PointerButton.None
      this.resultOperation = UserOperation.None
    }

    private updateButtonDown(e: PointerEvent): void {
      if (e.buttons === 1 || e.buttons === 2 || e.buttons === 4)
        this.pointerButtonDown = e.buttons
      else
        this.pointerButtonDown = PointerButton.None
    }

    private updatePosition(e: PointerEvent | WheelEvent, resetPrevious: boolean = false): void {
      let offsetX = e.offsetX
      let offsetY = e.offsetY
      let element: HTMLElement | undefined = e.target as HTMLElement
      while (element && (element !== this.element)) {
        offsetX += element.offsetLeft
        offsetY += element.offsetTop
        element = element.parentElement as HTMLElement
      }
      if (!element) {
        offsetX = e.offsetX
        offsetY = e.offsetY
      }

      if (resetPrevious) {
        this.previousX = offsetX
        this.previousY = offsetY
      } else {
        this.previousX = this.x
        this.previousY = this.y
      }
      this.x = offsetX
      this.y = offsetY
      this.modifiers = UserInput.extractModifierKeys(e)
    }

    private updateResult(operation: UserOperation): void {
      this.resultModifiers = this.modifiers
      this.resultPointerButton = operation === UserOperation.Scroll ? PointerButton.None : this.pointerButtonDown
      this.resultOperation = operation
    }

    private clearAll(): void {
      this.active = false
      this.touched = false
      // Keyboard
      this.keyDown = ''
      this.modifiers = KeyboardModifiers.None
      // Pointer
      this.x = 0
      this.y = 0
      this.previousX = 0
      this.previousY = 0
      this.scrollDeltaX = 0
      this.scrollDeltaY = 0
      this.pointerButtonDown = PointerButton.None
      // Dragging
      this.dragging = false
      this.draggingStartX = 0
      this.draggingStartY = 0
      this.draggingStartModifiers = KeyboardModifiers.None
      // Result
      this.resultKey = ''
      this.resultModifiers = KeyboardModifiers.None
      this.resultPointerButton = PointerButton.None
      this.resultOperation = UserOperation.None
    }

    private clearDraggingStart(): void {
      this.draggingStartX = 0
      this.draggingStartY = 0
      this.draggingStartModifiers = KeyboardModifiers.None
    }

    private static extractModifierKeys(e: PointerEvent | KeyboardEvent | WheelEvent): KeyboardModifiers {
      let modifiers = KeyboardModifiers.None
      if (e.ctrlKey)
        modifiers = modifiers | KeyboardModifiers.Control
      else
        modifiers = modifiers & ~KeyboardModifiers.Control
      if (e.shiftKey)
        modifiers = modifiers | KeyboardModifiers.Shift
      else
        modifiers = modifiers & ~KeyboardModifiers.Shift
      if (e.altKey)
        modifiers = modifiers | KeyboardModifiers.Alt
      else
        modifiers = modifiers & ~KeyboardModifiers.Alt
      return modifiers
    }
}
