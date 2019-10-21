// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action } from 'reactronic'

export enum InteractionModifiers {
  None = 0,
  Ctrl = 1,
  Shift = 2,
  Alt = 4,
  CtrlShift = 1 + 2,
  CtrlAlt = 1 + 4,
  CtrlShiftAlt = 1 + 2 + 4,
  ShiftAlt = 2 + 4,
}

export enum InteractionButton {
  None = 0,
  Left = 1,
  Right = 2,
  Middle = 4,
}

export enum InteractionResult {
  None = 0,
  Touch = 1,
  Click = 2,
  Scroll = 3,
  Zoom = 4,
  Drag = 5,
  Drop = 6,
}

export class Interaction extends State {
  element?: HTMLElement
  modifiers: InteractionModifiers
  active: boolean
  touched: boolean
  captured: boolean
  x: number
  y: number
  previousX: number
  previousY: number
  scrollDeltaX: number
  scrollDeltaY: number
  draggingThreshold: number
  dragging: boolean
  draggingStartX: number
  draggingStartY: number
  draggingStartModifiers: InteractionModifiers
  buttonDown: InteractionButton
  // Result
  result: InteractionResult
  resultButton: InteractionButton
  resultModifiers: InteractionModifiers

  constructor() {
    super()
    this.element = undefined
    this.modifiers = InteractionModifiers.None
    this.active = false
    this.touched = false
    this.captured = false
    this.buttonDown = InteractionButton.None
    this.x = 0
    this.y = 0
    this.previousX = 0
    this.previousY = 0
    this.scrollDeltaX = 0
    this.scrollDeltaY = 0
    this.draggingThreshold = 4
    this.dragging = false
    this.draggingStartX = 0
    this.draggingStartY = 0
    this.draggingStartModifiers = InteractionModifiers.None
    // Result
    this.result = InteractionResult.None
    this.resultButton = 0
    this.resultModifiers = InteractionModifiers.None
  }

  @action
  setElement(element: HTMLElement | undefined, listen: boolean): void {
    const existing = this.element
    if (element !== existing) {
      if (existing !== undefined) {
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
    this.updatePosition(e)
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
    if (this.buttonDown !== InteractionButton.None) {
      if (this.element) {
        this.element.setPointerCapture(e.pointerId)
        this.captured = true
      }
      this.updatePosition(e)
      this.draggingStartX = e.offsetX
      this.draggingStartY = e.offsetY
      this.draggingStartModifiers = Interaction.extractModifierKeys(e)
    }
    else if (this.element)
      this.element.releasePointerCapture(e.pointerId)
    this.clearResult()
  }

  @action
  onPointerMove(e: PointerEvent): void {
    this.updatePosition(e)
    if (this.captured && this.buttonDown !== InteractionButton.None && this.buttonDown === e.buttons) {
      if (!this.dragging &&
        (Math.abs(this.x - this.draggingStartX) > this.draggingThreshold ||
          Math.abs(this.y - this.draggingStartY) > this.draggingThreshold)) {
        this.dragging = true
      }
      if (this.dragging)
        this.updateResult(InteractionResult.Drag)
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
      this.buttonDown !== InteractionButton.None &&
      e.buttons === InteractionButton.None
    if (clickOrDrop) {
      if (this.element) {
        this.element.releasePointerCapture(e.pointerId)
        this.captured = false
      }
      this.updateResult(this.dragging ? InteractionResult.Drop : InteractionResult.Click)
      this.dragging = false
      this.buttonDown = InteractionButton.None
    }
    e.preventDefault()
  }

  @action
  onWheel(e: WheelEvent): void {
    this.updatePosition(e)
    if (!this.dragging && this.buttonDown === InteractionButton.None) {
      this.scrollDeltaX = e.deltaX
      this.scrollDeltaY = e.deltaY
      this.updateResult(InteractionResult.Scroll)
    }
    e.preventDefault()
  }

  @action
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.clearResult()
      this.dragging = false
      this.buttonDown = InteractionButton.None
    }
    else if (e.key === 'Control')
      this.modifiers = this.modifiers | InteractionModifiers.Ctrl
    else if (e.key === 'Shift')
      this.modifiers = this.modifiers | InteractionModifiers.Shift
    else if (e.key === 'Alt')
      this.modifiers = this.modifiers | InteractionModifiers.Alt
  }

  @action
  onKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Control')
      this.modifiers = this.modifiers & ~InteractionModifiers.Ctrl
    else if (e.key === 'Shift')
      this.modifiers = this.modifiers & ~InteractionModifiers.Shift
    else if (e.key === 'Alt')
      this.modifiers = this.modifiers & ~InteractionModifiers.Alt
  }

  @action
  onTouchStart(e: TouchEvent): void {
    this.touched = true
  }

  @action
  onTouchEnd(e: TouchEvent): void {
    this.touched = false
  }

  @action
  clearResult(): void {
    this.scrollDeltaX = 0
    this.scrollDeltaY = 0
    this.result = InteractionResult.None
    this.resultButton = InteractionButton.None
    this.resultModifiers = InteractionModifiers.None
  }

  private updateButtonDown(e: PointerEvent): void {
    if (e.buttons === 1 || e.buttons === 2 || e.buttons === 4)
      this.buttonDown = e.buttons
    else
      this.buttonDown = InteractionButton.None
  }

  private updatePosition(e: PointerEvent | WheelEvent): void {
    this.previousX = this.x
    this.previousY = this.y
    this.x = e.offsetX
    this.y = e.offsetY
    this.modifiers = Interaction.extractModifierKeys(e)
  }

  private updateResult(result: InteractionResult): void {
    this.result = result
    this.resultButton = result === InteractionResult.Scroll ? InteractionButton.None : this.buttonDown
    this.resultModifiers = this.modifiers
  }

  private clearAll(): void {
    this.active = false
    this.modifiers = InteractionModifiers.None
    this.touched = false
    this.x = 0
    this.y = 0
    this.previousX = 0
    this.previousY = 0
    this.scrollDeltaX = 0
    this.scrollDeltaY = 0
    this.dragging = false
    this.draggingStartX = 0
    this.draggingStartY = 0
    this.draggingStartModifiers = InteractionModifiers.None
    this.buttonDown = InteractionButton.None
    this.result = InteractionResult.None
    this.resultButton = InteractionButton.None
    this.resultModifiers = InteractionModifiers.None
  }

  private clearDraggingStart(): void {
    this.draggingStartX = 0
    this.draggingStartY = 0
    this.draggingStartModifiers = InteractionModifiers.None
  }

  private static extractModifierKeys(e: PointerEvent | KeyboardEvent | WheelEvent): InteractionModifiers {
    let modifiers = InteractionModifiers.None
    if (e.ctrlKey)
      modifiers = modifiers | InteractionModifiers.Ctrl
    else
      modifiers = modifiers & ~InteractionModifiers.Ctrl
    if (e.shiftKey)
      modifiers = modifiers | InteractionModifiers.Shift
    else
      modifiers = modifiers & ~InteractionModifiers.Shift
    if (e.altKey)
      modifiers = modifiers | InteractionModifiers.Alt
    else
      modifiers = modifiers & ~InteractionModifiers.Alt
    return modifiers
  }
}
