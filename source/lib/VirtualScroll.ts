// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, State, trigger } from 'reactronic'

import { Area, area, XY, xy } from './Area'

export const SURFACE_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
export const TARGET_GRID_SIZE_LIMIT: Area = area(0, 0, 999, 999)

export type Guide = { index: number, till: number }

export class Sizing {
  customCellWidth: Guide[] = [] // in pixels?
  customCellHeight: Guide[] = [] // in pixels?
}

export type IComponent = {
  readonly clientWidth: number
  readonly clientHeight: number
  readonly scrollWidth: number
  readonly scrollHeight: number
  scrollLeft: number
  scrollTop: number
}

export class VirtualScroll extends State {
  allCells: Area
  component: IComponent | null | undefined = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 2.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponent(component: IComponent | null, fontSize: number): void {
    if (component) {
      this.component = component
      this.ppc = xy(fontSize * 8, fontSize)
      this.surface = this.all.truncateBy(SURFACE_SIZE_LIMIT)
      this.thumb = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.viewport = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
    }
    else {
      this.targetGrid = Area.ZERO
      this.viewport = Area.ZERO
      this.thumb = Area.ZERO
      this.surface = Area.ZERO
      this.ppc = xy(1, 1)
      this.component = undefined
    }
  }

  // Factors

  get pixelToCellFactor(): XY {
    const r = this.ppc
    return xy(1 / r.x, 1 / r.y)
  }

  get viewportToSurfaceFactor(): XY {
    const surface = this.surface
    const vp = this.viewport
    return xy(
      surface.size.x / (vp.size.x - 1),
      surface.size.y / (vp.size.y - 1))
  }

  get surfaceToViewportFactor(): XY {
    const vp2s = this.viewportToSurfaceFactor
    return xy(1 / vp2s.x, 1 / vp2s.y)
  }

  get surfaceToAllFactor(): XY {
    const all = this.all
    const surface = this.surface
    const vp = this.viewport
    return xy(
      all.size.x / (surface.size.x - vp.size.x),
      all.size.y / (surface.size.y - vp.size.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get viewportToAllFactor(): XY {
    const all = this.all
    const vp = this.viewport
    return xy(
      all.size.x / (vp.size.x - 1),
      all.size.y / (vp.size.y - 1))
  }

  get allToViewportFactor(): XY {
    const vp2a = this.viewportToAllFactor
    return xy(1 / vp2a.x, 1 / vp2a.y)
  }

  // Areas (pixels)

  get all(): Area {
    return this.allCells.scaleBy(this.ppc)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.ppc)
  }

  get ready(): Area {
    return this.readyCells.scaleBy(this.ppc)
  }

  // Areas (cells)

  get surfaceCells(): Area {
    return this.surface.scaleBy(this.pixelToCellFactor)
  }

  get bufferCells(): Area {
    const vpc = this.viewportCells
    const buf = vpc.zoomAt(vpc.center, this.bufferSize)
    return buf.roundToOuter().truncateBy(this.allCells)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.pixelToCellFactor)
  }

  // Events

  scroll(): void {
    const c = this.component
    if (c) {
      const t = this.thumb
      if (Math.abs(t.y - c.scrollTop) > 1/devicePixelRatio ||
        Math.abs(t.x - c.scrollLeft) > 1/devicePixelRatio)
        this.moveTo(c.scrollLeft, c.scrollTop)
    }
  }

  setReadyCells(cells: Area): void {
    // console.log(`\nready: ${cells.y}..${cells.till.y}`)
    this.readyCells = cells
    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()

    const scroll = this.surface.atZero()
    const scrollPixelStep = this.viewportToSurfaceFactor
    const a2s = this.allToSurfaceFactor
    const vp = this.viewport

    let surface = this.surface
    let thumb = this.thumb
    const x = VirtualScroll.rebase(thumb.x, thumb.till.x, vp.x,
      surface.x, surface.size.x, scrollPixelStep.x, a2s.x)
    const y = VirtualScroll.rebase(thumb.y, thumb.till.y, vp.y,
      surface.y, surface.size.y, scrollPixelStep.y, a2s.y)

    surface = surface.moveTo(xy(x.surface, y.surface), this.all)
    if (!surface.equalTo(this.surface))
    {
      // console.log(`rebase: ${this.surface.y}(${this.surface.x}) -> ${surface.y}(${surface.x}), h=${this.component ? this.component.scrollHeight : '?'}`)
      thumb = thumb.moveTo(xy(
        surface.x !== this.surface.x ? x.thumb : thumb.x,
        surface.y !== this.surface.y ? y.thumb : thumb.y), scroll)
      this.surface = surface
      this.thumb = thumb
    }
  }

  // Actions & Triggers

  @action
  protected moveTo(left: number, top: number): void {
    // console.log(`\nscroll: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const surface = this.surface
    const s2a = this.surfaceToAllFactor
    const scrollPixelStep = this.viewportToSurfaceFactor
    const thumb = this.thumb.moveTo(xy(left, top), surface.atZero())

    let vp = this.viewport
    const x = VirtualScroll.shiftOrJump(thumb.x, thumb.till.x,
      vp.x, vp.size.x, surface.x, surface.size.x,
      scrollPixelStep.x, s2a.x)
    const y = VirtualScroll.shiftOrJump(thumb.y, thumb.till.y,
      vp.y, vp.size.y, surface.y, surface.size.y,
      scrollPixelStep.y, s2a.y)

    vp = vp.moveTo(xy(x, y), this.all)
    if (!vp.equalTo(this.viewport)) {
      this.viewport = vp
      this.surface = surface.moveTo(xy(vp.x - thumb.x, vp.y - thumb.y), this.all)
    }
    this.thumb = thumb
  }

  @trigger
  protected syncThumbWithDevice(): void {
    const c = this.component
    if (c) {
      const thumb = this.thumb
      if (Math.abs(thumb.x - c.scrollLeft) > 0.1)
        c.scrollLeft = thumb.x
      if (Math.abs(thumb.y - c.scrollTop) > 0.1)
        c.scrollTop = thumb.y
    }
  }

  // Math

  private static shiftOrJump(thumb: number, thumbTill: number,
    existing: number, vpSize: number, surface: number, surfaceSize: number,
    scrollPixelStep: number, surfaceToAllRatio: number): number {
    const diff = Math.abs(surface + thumb - existing)
    const jump = diff > 3*vpSize || (diff > 0.5*vpSize &&
      (thumb < 1 || thumbTill >= surfaceSize))
    let result: number
    if (jump) {
      const factor = (thumb - surfaceSize/2) / surfaceSize * 2
      const correction = 4/5 * scrollPixelStep * factor
      result = (thumb + correction) * surfaceToAllRatio
    }
    else
      result = surface + thumb
    // if (vp !== result) console.log(`${jump ? 'jump' : 'shift'}: thumb=${thumb}, viewport=${vp}->${result}`)
    return result
  }

  protected static rebase( thumb: number, thumbTill: number,
    vp: number, surface: number, surfaceSize: number,
    scrollPixelStep: number, allToSurfaceRatio: number): { thumb: number, surface: number } {
    const precise = vp * allToSurfaceRatio
    const factor = (surfaceSize/2 - precise) / surfaceSize * 2
    const optimal = precise + 4/5*scrollPixelStep * factor
    const result = { thumb, surface }
    if (Math.abs(optimal - thumb) > 1/3*scrollPixelStep) {
      result.thumb = optimal
      result.surface = vp - result.thumb
    }
    // else if (thumb < 1 || thumbTill >= surfaceSize) {
    //   if (ideal > 0)
    //     result.thumb = ideal + 4/5*page * (surfaceSize/2 - ideal) / surfaceSize * 2
    //   result.surface = viewport - result.thumb
    // }
    else if (surface !== vp - result.thumb) {
      result.surface = vp - result.thumb
    }
    return result
  }
}
