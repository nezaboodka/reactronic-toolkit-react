// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, State, trigger } from 'reactronic'

import { Area, area, num, XY, xy } from './Area'

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
  resolution: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.5)
  loadedCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  // scrollingMonitor: Monitor = Monitor.create('scrolling', 500)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponent(component: IComponent | null, resolution: number): void {
    if (component) {
      this.component = component
      this.resolution = xy(resolution * 8, resolution)
      this.surface = this.all.truncateBy(SURFACE_SIZE_LIMIT)
      this.thumb = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.viewport = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
      // Cache.of(this.moveTo).setup({monitor: this.scrollingMonitor})
    }
    else {
      // Cache.of(this.moveTo).setup({monitor: null})
      this.targetGrid = Area.ZERO
      this.viewport = Area.ZERO
      this.thumb = Area.ZERO
      this.surface = Area.ZERO
      this.resolution = xy(1, 1)
      this.component = undefined
    }
  }

  // Factors

  get pixelToCellFactor(): XY {
    const r = this.resolution
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
    return this.allCells.scaleBy(this.resolution)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.resolution)
  }

  get loaded(): Area {
    return this.loadedCells.scaleBy(this.resolution)
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

  ready(cells: Area): void {
    // console.log(`ready: ${cells.y}..${cells.till.y}`)
    this.loadedCells = cells

    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()

    const scroll = this.surface.atZero()
    const scrollPixelStep = this.viewportToSurfaceFactor
    const ratio = this.allToSurfaceFactor
    const vp = this.viewport

    let surface = this.surface
    let thumb = this.thumb
    const x = VirtualScroll.rebase(vp.x, surface.x, surface.size.x,
      thumb.x, thumb.till.x, scrollPixelStep.x, ratio.x)
    const y = VirtualScroll.rebase(vp.y, surface.y, surface.size.y,
      thumb.y, thumb.till.y, scrollPixelStep.y, ratio.y)

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
    // console.log(`scroll: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const surface = this.surface
    const ratio = this.surfaceToAllFactor
    const scrollPixelStep = this.viewportToSurfaceFactor
    const thumb = this.thumb.moveTo(xy(left, top), surface.atZero())

    let vp = this.viewport
    const x = VirtualScroll.jumpOrShift(vp.x, vp.size.x,
      thumb.x, thumb.till.x, surface.x, surface.size.x,
      scrollPixelStep.x, ratio.x)
    const y = VirtualScroll.jumpOrShift(vp.y, vp.size.y,
      thumb.y, thumb.till.y, surface.y, surface.size.y,
      scrollPixelStep.y, ratio.y)

    vp = vp.moveTo(xy(x, y), this.all)
    if (!vp.equalTo(this.viewport))
      this.viewport = vp
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

  private static jumpOrShift(viewport: number, viewportSize: number,
    thumb: number, thumbTill: number, surface: number, surfaceSize: number,
    scrollPixelStep: number, factor: number): number {
    const delta = Math.abs(surface + thumb - viewport)
    const jump = delta > 3*viewportSize ||
      (delta > 0.5*viewportSize && (thumb < 1 || thumbTill >= surfaceSize))
    let result: number
    if (jump) {
      const precise = thumb * factor
      result = precise // - 4/5*scrollPixelStep * (surfaceSize/2 - precise) / surfaceSize * 2
    }
    else
      result = surface + thumb
    return result
  }

  protected static rebase(viewport: number,
    surface: number, surfaceSize: number, thumb: number, thumbTill: number,
    scrollPixelStep: number, factor: number): { thumb: number, surface: number } {
    const precise = viewport * factor
    const optimal = precise + 4/5*scrollPixelStep * (surfaceSize/2 - precise) / surfaceSize * 2
    const result = { thumb, surface }
    if (Math.abs(optimal - thumb) > 1/3*scrollPixelStep) {
      result.thumb = optimal
      result.surface = viewport - result.thumb
    }
    // else if (thumb < 1 || thumbTill >= surfaceSize) {
    //   if (ideal > 0)
    //     result.thumb = ideal + 4/5*page * (surfaceSize/2 - ideal) / surfaceSize * 2
    //   result.surface = viewport - result.thumb
    // }
    else if (surface !== viewport - result.thumb) {
      result.surface = viewport - result.thumb
    }
    return result
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
