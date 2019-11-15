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
  display: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  loadedCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  scrollingMonitor: Monitor = Monitor.create('scrolling', 30)

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
      this.display = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
      Cache.of(this.moveTo).setup({monitor: this.scrollingMonitor})
    }
    else {
      Cache.of(this.moveTo).setup({monitor: null})
      this.targetGrid = Area.ZERO
      this.display = Area.ZERO
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
    const dc = this.displayCells
    return dc.zoomAt(dc.center, this.bufferSize).roundToOuter().truncateBy(this.allCells)
  }

  get displayCells(): Area {
    return this.display.scaleBy(this.pixelToCellFactor)
  }

  // Actions

  onScroll(): void {
    const d = this.component
    if (d) {
      const t = this.thumb
      if (Math.abs(t.y - d.scrollTop) > 0.1 || Math.abs(t.x - d.scrollLeft) > 0.1)
        this.moveTo(d.scrollLeft, d.scrollTop)
    }
  }

  setLoadedCells(lc: Area): void {
    this.loadedCells = lc
    const tg = this.targetGrid
    if (!tg.envelops(lc))
      this.targetGrid = tg.moveCenterTo(lc.center, this.allCells).round()
  }

  @action
  protected moveTo(cx: number, cy: number): void {
    // console.log(`scroll: ${cy} (∆ ${cy - this.thumb.y}), h=${this.component ? this.component.scrollHeight : '?'}`)
    const bounds = this.surface.moveTo(Area.ZERO, this.all)
    const t = this.thumb = this.thumb.moveTo(xy(cx, cy), bounds)
    let surf = this.surface
    let disp = this.display
    const x = surf.x + t.x
    const y = surf.y + t.y
    const s2a = this.surfaceToAllFactor
    const dx = Math.abs(x - disp.x)
    if (dx > 2 * disp.size.x || (dx > disp.size.x / 2 && (cx < 1 || cx >= surf.size.x - disp.size.x))) {
      const disp2 = disp.moveTo(xy(Math.ceil(cx * s2a.x), disp.y), this.all)
      if (!disp2.equalTo(disp)) {
        this.display = disp = disp2
        this.surface = surf = surf.moveTo(xy(disp2.x - t.x, surf.y), this.all)
      }
    }
    else {
      const disp2 = disp.moveTo(xy(x, disp.y), this.all)
      if (!disp2.equalTo(disp)) {
        this.display = disp = disp2
        // to adjust surface
      }
    }
    const dy = Math.abs(y - disp.y)
    if (dy > 2 * disp.size.y || (dy > disp.size.y / 2 && (cy < 1 || cy >= surf.size.y - disp.size.y))) {
      const disp2 = disp.moveTo(xy(disp.x, Math.ceil(cy * s2a.y)), this.all)
      if (!disp2.equalTo(disp)) {
        this.display = disp = disp2
        this.surface = surf = surf.moveTo(xy(surf.x, disp2.y - t.y), this.all)
      }
    }
    else {
      const disp2 = disp.moveTo(xy(disp.x, y), this.all)
      if (!disp2.equalTo(disp)) {
        this.display = disp = disp2
        // to adjust surface
      }
    }
  }

  protected rebaseSurface(): void {
    let s = this.surface
    let t = this.thumb
    const disp = this.display
    const d2s = this.displayToSurfaceFactor
    const precise = disp.scaleBy(this.allToSurfaceFactor)
    const median = xy(precise.x + d2s.x/2, precise.y + d2s.y/2)
    const diff = xy(t.x - median.x, t.y - median.y)
    if (Math.abs(diff.x) > d2s.x/3) {
      const advance = d2s.x * ((2*s.size.x/3 - precise.x) / s.size.x)
      const t2 = t.moveTo(xy(precise.x + advance, t.y), s.moveTo(Area.ZERO, this.all))
      const s2 = s.moveTo(xy(disp.x - t2.x, s.y), this.all)
      if (!s2.equalTo(s)) {
        this.surface = s = s2
        this.thumb = t = t2
      }
    }
    if (Math.abs(diff.y) > d2s.y/3) {
      // console.log(`rebase: ${diff.y} diff`)
      const advance = d2s.y * ((2*s.size.y/3 - precise.y) / s.size.y)
      const t2 = t.moveTo(xy(t.x, precise.y + advance), s.moveTo(Area.ZERO, this.all))
      const s2 = s.moveTo(xy(s.x, disp.y - t2.y), this.all)
      if (!s2.equalTo(s)) {
        this.surface = s = s2
        this.thumb = t = t2
      }
    }
  }

  @trigger
  protected syncThumbAndSurface(): void {
    if (this.component && !this.scrollingMonitor.busy)
      this.rebaseSurface()
  }

  @trigger
  protected syncThumbWithDevice(): void {
    const c = this.component
    if (c) {
      const t = this.thumb
      if (Math.abs(t.x - c.scrollLeft) > 0.1)
        c.scrollLeft = t.x
      if (Math.abs(t.y - c.scrollTop) > 0.1)
        c.scrollTop = t.y
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
