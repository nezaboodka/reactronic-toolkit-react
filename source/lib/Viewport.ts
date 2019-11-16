// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache,Monitor, State, trigger } from 'reactronic'

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

export class Viewport extends State {
  allCells: Area
  component: IComponent | null | undefined = undefined
  resolution: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  visible: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  loadedCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  scrollingMonitor: Monitor = Monitor.create('scrolling', 500)

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
      this.visible = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
      Cache.of(this.moveTo).setup({monitor: this.scrollingMonitor})
    }
    else {
      Cache.of(this.moveTo).setup({monitor: null})
      this.targetGrid = Area.ZERO
      this.visible = Area.ZERO
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

  get visibleToSurfaceFactor(): XY {
    const surface = this.surface
    const visible = this.visible
    return xy(
      surface.size.x / (visible.size.x - 1),
      surface.size.y / (visible.size.y - 1))
  }

  get surfaceToVisibleFactor(): XY {
    const v2s = this.visibleToSurfaceFactor
    return xy(1 / v2s.x, 1 / v2s.y)
  }

  get surfaceToAllFactor(): XY {
    const all = this.all
    const surface = this.surface
    const visible = this.visible
    return xy(
      all.size.x / (surface.size.x - visible.size.x),
      all.size.y / (surface.size.y - visible.size.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get visibleToAllFactor(): XY {
    const all = this.all
    const visible = this.visible
    return xy(
      all.size.x / (visible.size.x - 1),
      all.size.y / (visible.size.y - 1))
  }

  get allToVisibleFactor(): XY {
    const v2a = this.visibleToAllFactor
    return xy(1 / v2a.x, 1 / v2a.y)
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
    const vc = this.visibleCells
    const buf = vc.zoomAt(vc.center, this.bufferSize)
    return buf.roundToOuter().truncateBy(this.allCells)
  }

  get visibleCells(): Area {
    return this.visible.scaleBy(this.pixelToCellFactor)
  }

  // Events

  scroll(): void {
    const c = this.component
    if (c) {
      const thumb = this.thumb
      if (Math.abs(thumb.y - c.scrollTop) >= 0.5/devicePixelRatio ||
        Math.abs(thumb.x - c.scrollLeft) >= 0.5/devicePixelRatio)
        this.moveTo(c.scrollLeft, c.scrollTop)
    }
  }

  ready(cells: Area): void {
    this.loadedCells = cells

    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()

    const scroll = this.surface.atZero()
    const scrollPixelStep = this.visibleToSurfaceFactor
    const ideal = this.visible.scaleBy(this.allToSurfaceFactor)
    let thumb = this.thumb
    if (Math.abs(ideal.x - thumb.x) > 4/5*scrollPixelStep.x || thumb.from.x < 1 || thumb.till.x >= scroll.size.x) {
      const s = this.surface
      const correction = 4/5*scrollPixelStep.x * (scroll.center.x - ideal.center.x) / scroll.size.x * 2
      const t2 = thumb.moveTo(xy(ideal.x + correction, thumb.y), scroll)
      const s2 = s.moveTo(xy(this.visible.x - t2.x, s.y), this.all)
      if (!s2.equalTo(s)) {
        this.surface = s2
        this.thumb = t2
      }
    }
    thumb = this.thumb
    if (Math.abs(ideal.y - thumb.y) > 4/5*scrollPixelStep.y || thumb.from.y < 1 || thumb.till.y >= scroll.size.y) {
      const s = this.surface
      const correction = 4/5*scrollPixelStep.y * (scroll.center.y - ideal.center.y) / scroll.size.y * 2
      const t2 = thumb.moveTo(xy(thumb.x, ideal.y + correction), scroll)
      const s2 = s.moveTo(xy(s.x, this.visible.y - t2.y), this.all)
      if (!s2.equalTo(s)) {
        // console.log(`rebase: ${rebase} // diff=${diff.y}, thumb=${t.y}->${t2.y}, surface=${s.y}->${s2.y}`)
        this.surface = s2
        this.thumb = t2
      }
    }
  }

  // Actions & Triggers

  @action
  protected moveTo(left: number, top: number): void {
    // console.log(`scroll: ${this.thumb.y}->${cy}, h=${this.component ? this.component.scrollHeight : '?'}`)

    const surface = this.surface
    const ratio = this.surfaceToAllFactor
    const t = this.thumb = this.thumb.moveTo(xy(left, top), surface.atZero())
    let vp = this.visible

    const x = this.move(t.x, t.till.x, surface.x, surface.size.x,
      vp.x, vp.size.x, ratio.x)
    const y = this.move(t.y, t.till.y, surface.y, surface.size.y,
      vp.y, vp.size.y, ratio.y)

    vp = vp.moveTo(xy(x, y), this.all)
    if (!vp.equalTo(this.visible))
      this.visible = vp
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

  private move(thumb: number, thumbTill: number,
    surface: number, surfaceSize: number,
    viewport: number, page: number, factor: number): number {
    const delta = Math.abs(surface + thumb - viewport)
    const jump = delta > 1.5*page ||
      (delta > 0.5*page && (thumb < 1 || thumbTill >= surfaceSize))
    return jump ? thumb * factor : surface + thumb
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
