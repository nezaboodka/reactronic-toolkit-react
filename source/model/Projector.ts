// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache,Monitor, State, trigger } from 'reactronic'

import { Area, area, num, XY, xy } from './Area'

export const SURFACE_PIXEL_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
export const SURFACE_GRID_SIZE_LIMIT: Area = area(0, 0, 999, 999)
export type Guide = { index: number, coord: number }
export class Sizing {
  defaultCellWidthFactor: number = 8 // measured in cell height ('em')
  customCellWidth: Guide[] = [] // in pixels?
  customCellHeight: Guide[] = [] // in pixels?
}

export type IElement = {
  readonly clientWidth: number
  readonly clientHeight: number
  readonly scrollWidth: number
  readonly scrollHeight: number
  scrollLeft: number
  scrollTop: number
}

export class Projector extends State {
  allCells: Area
  element: IElement | null | undefined = undefined
  resolution: number = 1 // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  grid: Area = Area.ZERO
  viewport: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  loadedCells: Area = Area.ZERO
  sizing = new Sizing()
  scrollingMonitor: Monitor = Monitor.create('scrolling', 30)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setElement(element: IElement | null, resolution: number): void {
    if (element) {
      this.element = element
      this.resolution = resolution
      this.surface = this.all.truncateBy(SURFACE_PIXEL_SIZE_LIMIT)
      this.thumb = new Area(0, 0, element.clientWidth, element.clientHeight)
      this.grid = this.allCells.truncateBy(SURFACE_GRID_SIZE_LIMIT)
      this.viewport = new Area(0, 0, element.clientWidth, element.clientHeight)
      Cache.of(this.moveViewportTo).setup({monitor: this.scrollingMonitor})
    }
    else {
      Cache.of(this.moveViewportTo).setup({monitor: null})
      this.viewport = Area.ZERO
      this.grid = Area.ZERO
      this.thumb = Area.ZERO
      this.surface = Area.ZERO
      this.resolution = 1
      this.element = undefined
    }
  }

  // Factors

  get cellToPixelFactor(): XY {
    const r = this.resolution
    return xy(r * this.sizing.defaultCellWidthFactor, r)
  }

  get pixelToCellFactor(): XY {
    const c2p = this.cellToPixelFactor
    return xy(1 / c2p.x, 1 / c2p.y)
  }

  get viewportToSurfaceFactor(): XY {
    const s = this.surface.size
    const v = this.viewport.size
    return xy(s.x / (v.x - 1), s.y / (v.y - 1))
  }

  get surfaceToViewportFactor(): XY {
    const v2s = this.viewportToSurfaceFactor
    return xy(1 / v2s.x, 1 / v2s.y)
  }

  get surfaceToAllFactor(): XY {
    const a = this.all.size
    const s = this.surface.size
    const d = this.viewport.size
    return xy(a.x / (s.x - d.x), a.y / (s.y - d.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get viewportToAllFactor(): XY {
    const a = this.all.size
    const v = this.viewport.size
    return xy(a.x / (v.x - 1), a.y / (v.y - 1))
  }

  get allToViewportFactor(): XY {
    const v2a = this.viewportToAllFactor
    return xy(1 / v2a.x, 1 / v2a.y)
  }

  // Areas (pixels)

  get all(): Area {
    return this.allCells.scaleBy(this.cellToPixelFactor)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.cellToPixelFactor)
  }

  get loaded(): Area {
    return this.loadedCells.scaleBy(this.cellToPixelFactor)
  }

  // Areas (cells)

  get surfaceCells(): Area {
    return this.surface.scaleBy(this.pixelToCellFactor)
  }

  get bufferCells(): Area {
    const d = this.viewportCells
    return d.zoomAt(d.center, this.bufferSize).roundToOuter().truncateBy(this.allCells)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.pixelToCellFactor)
  }

  // Actions

  handleElementScroll(): void {
    const element = this.element
    if (element) {
      const t = this.thumb
      if (Math.abs(t.y - element.scrollTop) > 0.1 || Math.abs(t.x - element.scrollLeft) > 0.1)
        this.moveViewportTo(element.scrollLeft, element.scrollTop)
    }
  }

  handleElementWheel(dx: number, dy: number, dz: number, mode: number): void {
    // console.log(`wheel: ${dy} (mode=${mode})`)
  }

  confirmLoadedCells(a: Area): void {
    this.loadedCells = a
    if (!this.grid.envelops(a))
      this.grid = this.grid.moveCenterTo(a.center, this.allCells).round()
  }

  @action
  protected moveViewportTo(cx: number, cy: number): void {
    // console.log(`scroll: ${cy} (∆ ${cy - this.thumb.y}), h=${this.element ? this.element.scrollHeight : '?'}`)
    const s0 = this.surface.moveTo(Area.ZERO, this.all)
    this.thumb = this.thumb.moveTo(xy(cx, cy), s0)
    const t = this.thumb
    let s = this.surface
    let v = this.viewport
    const x = s.x + t.x
    const y = s.y + t.y
    const s2a = this.surfaceToAllFactor
    const dx = Math.abs(x - v.x)
    if (dx > 2 * v.size.x || (dx > v.size.x / 2 && (cx < 1 || cx >= s.size.x - v.size.x))) {
      const v2 = v.moveTo(xy(Math.ceil(cx * s2a.x), v.y), this.all)
      if (!v2.equalTo(v)) {
        this.viewport = v = v2
        this.surface = s = s.moveTo(xy(v2.x - t.x, s.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(x, v.y), this.all)
      if (!v2.equalTo(v)) {
        this.viewport = v = v2
        // to adjust surface
      }
    }
    const dy = Math.abs(y - v.y)
    if (dy > 2 * v.size.y || (dy > v.size.y / 2 && (cy < 1 || cy >= s.size.y - v.size.y))) {
      const v2 = v.moveTo(xy(v.x, Math.ceil(cy * s2a.y)), this.all)
      if (!v2.equalTo(v)) {
        this.viewport = v = v2
        this.surface = s = s.moveTo(xy(s.x, v2.y - t.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(v.x, y), this.all)
      if (!v2.equalTo(v)) {
        this.viewport = v = v2
        // to adjust surface
      }
    }
  }

  @trigger
  protected rebaseSurface(): void {
    const element = this.element
    if (element && !this.scrollingMonitor.busy) {
      let s = this.surface
      let t = this.thumb
      const v = this.viewport
      const v2s = this.viewportToSurfaceFactor
      const precise = v.scaleBy(this.allToSurfaceFactor)
      const median = xy(precise.x + v2s.x/2, precise.y + v2s.y/2)
      const diff = xy(t.x - median.x, t.y - median.y)
      if (Math.abs(diff.x) > v2s.x/3) {
        const tip = v2s.x * ((s.size.x / 2 - precise.x) / s.size.x)
        const t2 = t.moveTo(xy(precise.x + tip, t.y), s.moveTo(Area.ZERO, this.all))
        const s2 = s.moveTo(xy(v.x - t2.x, s.y), this.all)
        if (!s2.equalTo(s)) {
          this.surface = s = s2
          this.thumb = t = t2
        }
      }
      if (Math.abs(diff.y) > v2s.y/3) {
        const tip = v2s.y * ((s.size.y / 2 - precise.y) / s.size.y)
        const t2 = t.moveTo(xy(t.x, precise.y + tip), s.moveTo(Area.ZERO, this.all))
        const s2 = s.moveTo(xy(s.x, v.y - t2.y), this.all)
        if (!s2.equalTo(s)) {
          this.surface = s = s2
          this.thumb = t = t2
        }
      }
    }
  }

  @trigger
  protected syncThumbWithElement(): void {
    const element = this.element
    if (element) {
      const t = this.thumb
      if (Math.abs(t.x - element.scrollLeft) > 0.1)
        element.scrollLeft = t.x
      if (Math.abs(t.y - element.scrollTop) > 0.1)
        element.scrollTop = t.y
    }
  }

  // @action
  // zoomAt(origin: XY, factor: number): void {
  //   origin = this.surface.moveBy(origin, this.all)
  //   this.viewport = this.viewport.zoomAt(origin, xy(factor, factor))
  // }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
