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
  // Keyboard
  modifiers: InteractionModifiers
  // Pointer
  hovered: boolean
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
    // Keyboard
    this.modifiers = InteractionModifiers.None
    // Pointer
    this.hovered = false
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
  listen(element: HTMLElement | undefined): void {
    const existing = this.element
    if (element !== existing) {
      if (existing !== undefined) {
        existing.removeEventListener('pointerenter', this.onPointerEnter)
        existing.removeEventListener('pointerleave', this.onPointerLeave)
        existing.removeEventListener('pointerdown', this.onPointerDown)
        existing.removeEventListener('pointermove', this.onPointerMove)
        existing.removeEventListener('pointerup', this.onPointerUp)
        existing.removeEventListener('wheel', this.onWheel)
        existing.removeEventListener('keydown', this.onKeyDown)
        existing.removeEventListener('keyup', this.onKeyUp)
        existing.removeEventListener('touchstart', this.onTouchStart)
        existing.removeEventListener('touchend', this.onTouchEnd)
        existing.removeEventListener('blur', this.onBlur)
      }
      this.element = element
      if (element) {
        element.addEventListener('pointerenter', this.onPointerEnter)
        element.addEventListener('pointerleave', this.onPointerLeave)
        element.addEventListener('pointerdown', this.onPointerDown)
        element.addEventListener('pointermove', this.onPointerMove)
        element.addEventListener('pointerup', this.onPointerUp)
        element.addEventListener('wheel', this.onWheel)
        element.addEventListener('keydown', this.onKeyDown)
        element.addEventListener('keyup', this.onKeyUp)
        element.addEventListener('touchstart', this.onTouchStart)
        element.addEventListener('touchend', this.onTouchEnd)
        element.addEventListener('blur', this.onBlur)
      }
    }
  }

  @action
  onPointerEnter(e: PointerEvent): void {
    this.updateButtonDown(e)
    this.updatePosition(e)
    this.resetAction()
    this.resetDraggingStart()
    this.hovered = true
  }

  @action
  onPointerLeave(e: PointerEvent): void {
    this.updateButtonDown(e)
    this.updatePosition(e)
    this.resetAction()
    this.resetDraggingStart()
    this.hovered = false
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
      this.draggingStartModifiers = this.modifiers
    }
    else if (this.element)
      this.element.releasePointerCapture(e.pointerId)
    this.resetAction()
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
      if (this.dragging) {
        this.updateAction(InteractionResult.Drag)
      }
    }
    else {
      this.resetAction()
      this.resetDraggingStart()
    }
  }

  @action
  onPointerUp(e: PointerEvent): void {
    this.updatePosition(e)
    const clickOrEndDragging = this.captured &&
      this.buttonDown !== InteractionButton.None && e.buttons === InteractionButton.None
    if (clickOrEndDragging) {
      if (this.element) {
        this.element.releasePointerCapture(e.pointerId)
        this.captured = false
      }
      this.updateAction(this.dragging ? InteractionResult.Drop : InteractionResult.Click)
      this.dragging = false
      this.buttonDown = InteractionButton.None
    }
  }

  @action
  onWheel(e: WheelEvent): void {
    this.updatePosition(e)
    if (!this.dragging && this.buttonDown === InteractionButton.None) {
      this.scrollDeltaX = e.deltaX
      this.scrollDeltaY = e.deltaY
      this.updateAction(InteractionResult.Scroll)
    }
  }

  @action
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.resetAction()
      this.dragging = false
      this.buttonDown = InteractionButton.None
    }
    else
      this.modifiers = Interaction.extractModifierKeys(e)
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
  onBlur(e: FocusEvent): void {
    this.reset()
    this.hovered = false
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

  private updateAction(action: InteractionResult): void {
    this.result = action
    this.resultButton = action === InteractionResult.Scroll ? InteractionButton.None : this.buttonDown
    this.resultModifiers = this.modifiers
  }

  private reset(): void {
    this.buttonDown = 0
    this.buttonDown = InteractionButton.None
    this.modifiers = InteractionModifiers.None
    this.scrollDeltaX = 0
    this.scrollDeltaY = 0
    this.touched = false
    this.x = 0
    this.y = 0
    this.previousX = 0
    this.previousY = 0
    this.dragging = false
    this.draggingStartX = 0
    this.draggingStartY = 0
    this.draggingStartModifiers = InteractionModifiers.None
    this.result = InteractionResult.None
    this.resultButton = 0
    this.resultModifiers = InteractionModifiers.None
  }

  private resetAction(): void {
    this.scrollDeltaY = 0
    this.result = InteractionResult.None
    this.resultButton = 0
    this.resultModifiers = InteractionModifiers.None
  }

  private resetDraggingStart(): void {
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
