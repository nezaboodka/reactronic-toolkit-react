// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, trigger, Monitor, Cache } from 'reactronic'
import { XY, xy, Area, area, num } from './Area'

export const SURFACE_PIXEL_LIMIT: Area = area(0, 0, 1000123, 1000123)
export const GRID_CELL_LIMIT: Area = area(0, 0, 999, 999)
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

export class Viewport extends State {
  allCells: Area
  sizing = new Sizing()
  element: IElement | null | undefined = undefined
  resolution: number = 1 // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  grid: Area = Area.ZERO
  display: Area = Area.ZERO
  bufferSize: XY = xy(1.00, 1.00)
  loadedCells: Area = Area.ZERO
  scrollingMonitor: Monitor = Monitor.create('scrolling', 20)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setElement(element: IElement | null, resolution: number): void {
    if (element) {
      this.element = element
      this.resolution = resolution
      this.surface = this.all.truncateBy(SURFACE_PIXEL_LIMIT)
      this.thumb = new Area(0, 0, element.clientWidth, element.clientHeight)
      this.grid = this.allCells.truncateBy(GRID_CELL_LIMIT)
      this.display = new Area(0, 0, element.clientWidth, element.clientHeight)
      Cache.of(this.moveViewport).setup({monitor: this.scrollingMonitor})
    }
    else {
      Cache.of(this.moveViewport).setup({monitor: null})
      this.display = Area.ZERO
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

  get displayToSurfaceFactor(): XY {
    const s = this.surface.size
    const d = this.display.size
    return xy(s.x / (d.x - 1), s.y / (d.y - 1))
  }

  get surfaceToDisplayFactor(): XY {
    const d2s = this.displayToSurfaceFactor
    return xy(1 / d2s.x, 1 / d2s.y)
  }

  get surfaceToAllFactor(): XY {
    const a = this.all.size
    const s = this.surface.size
    const d = this.display.size
    return xy(a.x / (s.x - d.x), a.y / (s.y - d.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get displayToAllFactor(): XY {
    const a = this.all.size
    const d = this.display.size
    return xy(a.x / (d.x - 1), a.y / (d.y - 1))
  }

  get allToDisplayFactor(): XY {
    const d2a = this.displayToAllFactor
    return xy(1 / d2a.x, 1 / d2a.y)
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
    const d = this.displayCells
    return d.zoomAt(d.center, this.bufferSize).truncateBy(this.all).roundToOuter().truncateBy(this.allCells)
  }

  get displayCells(): Area {
    return this.display.scaleBy(this.pixelToCellFactor)
  }

  // Actions

  onScroll(): void {
    const element = this.element
    if (element) {
      const t = this.thumb
      if (Math.abs(t.y - element.scrollTop) > 0.1 || Math.abs(t.x - element.scrollLeft) > 0.1)
        this.moveViewport(element.scrollLeft, element.scrollTop)
    }
  }

  @action
  moveViewport(cx: number, cy: number): void {
    // console.log(`scroll: ${cy} (∆ ${cy - this.thumb.y}), h=${this.element ? this.element.scrollHeight : '?'}`)
    const s0 = this.surface.moveTo(Area.ZERO, this.all)
    this.thumb = this.thumb.moveTo(xy(cx, cy), s0)
    const t = this.thumb
    let s = this.surface
    let d = this.display
    const x = s.x + t.x
    const y = s.y + t.y
    const s2a = this.surfaceToAllFactor
    const dx = Math.abs(x - d.x)
    if (dx > 2 * d.size.x || (dx > d.size.x / 2 && (cx < 1 || cx >= s.size.x - d.size.x))) {
      const d2 = d.moveTo(xy(Math.ceil(cx * s2a.x), d.y), this.all)
      if (!d2.equalTo(d)) {
        this.display = d = d2
        this.surface = s = s.moveTo(xy(d2.x - t.x, s.y), this.all)
      }
    }
    else {
      const d2 = d.moveTo(xy(x, d.y), this.all)
      if (!d2.equalTo(d))
        this.display = d = d2
    }
    const dy = Math.abs(y - d.y)
    if (dy > 2 * d.size.y || (dy > d.size.y / 2 && (cy < 1 || cy >= s.size.y - d.size.y))) {
      const d2 = d.moveTo(xy(d.x, Math.ceil(cy * s2a.y)), this.all)
      if (!d2.equalTo(d)) {
        this.display = d = d2
        this.surface = s = s.moveTo(xy(s.x, d2.y - t.y), this.all)
      }
    }
    else {
      const d2 = d.moveTo(xy(d.x, y), this.all)
      if (!d2.equalTo(d))
        this.display = d = d2
    }
  }

  @trigger
  rebaseSurface(): void {
    const element = this.element
    if (element && !this.scrollingMonitor.busy) {
      let s = this.surface
      let t = this.thumb
      const d = this.display
      const d2s = this.displayToSurfaceFactor
      const precise = d.scaleBy(this.allToSurfaceFactor)
      const median = xy(precise.x + d2s.x/2, precise.y + d2s.y/2)
      const diff = xy(t.x - median.x, t.y - median.y)
      if (Math.abs(diff.x) > d2s.x/3) {
        const tip = d2s.x * ((s.size.x / 2 - precise.x) / s.size.x)
        const t2 = t.moveTo(xy(precise.x + tip, t.y), s.moveTo(Area.ZERO, this.all))
        const s2 = s.moveTo(xy(d.x - t2.x, s.y), this.all)
        if (!s2.equalTo(s)) {
          this.surface = s = s2
          this.thumb = t = t2
        }
      }
      if (Math.abs(diff.y) > d2s.y/3) {
        const tip = d2s.y * ((s.size.y / 2 - precise.y) / s.size.y)
        const t2 = t.moveTo(xy(t.x, precise.y + tip), s.moveTo(Area.ZERO, this.all))
        const s2 = s.moveTo(xy(s.x, d.y - t2.y), this.all)
        if (!s2.equalTo(s)) {
          this.surface = s = s2
          this.thumb = t = t2
        }
      }
    }
  }

  @trigger
  syncThumbWithElement(): void {
    const element = this.element
    if (element) {
      const t = this.thumb
      if (Math.abs(t.x - element.scrollLeft) > 0.1)
        element.scrollLeft = t.x
      if (Math.abs(t.y - element.scrollTop) > 0.1)
        element.scrollTop = t.y
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.surface.moveBy(origin, this.all)
    this.display = this.display.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
