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
    const surface = this.surface.size
    const visible = this.visible.size
    return xy(
      surface.x / (visible.x - 1),
      surface.y / (visible.y - 1))
  }

  get surfaceToVisibleFactor(): XY {
    const v2s = this.visibleToSurfaceFactor
    return xy(1 / v2s.x, 1 / v2s.y)
  }

  get surfaceToAllFactor(): XY {
    const all = this.all.size
    const surface = this.surface.size
    const visible = this.visible.size
    return xy(
      all.x / (surface.x - visible.x),
      all.y / (surface.y - visible.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get visibleToAllFactor(): XY {
    const all = this.all.size
    const visible = this.visible.size
    return xy(
      all.x / (visible.x - 1),
      all.y / (visible.y - 1))
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

  // Actions

  onScroll(): void {
    const c = this.component
    if (c) {
      const thumb = this.thumb
      if (Math.abs(thumb.y - c.scrollTop) >= 0.5/devicePixelRatio ||
        Math.abs(thumb.x - c.scrollLeft) >= 0.5/devicePixelRatio)
        this.moveTo(c.scrollLeft, c.scrollTop)
    }
  }

  setLoadedCells(cells: Area): void {
    this.loadedCells = cells
    const target = this.targetGrid
    if (!target.envelops(cells))
      this.targetGrid = target.moveCenterTo(cells.center, this.allCells).round()
  }

  @action
  protected moveTo(sx: number, sy: number): void {
    // console.log(`scroll: ${this.thumb.y}->${cy}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const z = this.surface.atZero()
    let v = this.visible
    let surface = this.surface
    const thumb = this.thumb = this.thumb.moveTo(xy(sx, sy), z)
    const x = surface.x + thumb.x
    const y = surface.y + thumb.y
    const dx = Math.abs(x - v.x)
    if (dx > 2 * v.size.x || (dx > v.size.x / 2 && (sx < 1 || sx >= surface.size.x - v.size.x))) {
      const v2 = v.moveTo(xy(Math.ceil((sx - this.visibleToSurfaceFactor.x/2) * this.surfaceToAllFactor.x), v.y), this.all)
      if (!v2.equalTo(v)) {
        this.visible = v = v2
        this.surface = surface = surface.moveTo(xy(v2.x - thumb.x, surface.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(x, v.y), this.all)
      if (!v2.equalTo(v)) {
        this.visible = v = v2
        // to adjust surface
      }
    }
    const dy = Math.abs(y - v.y)
    if (dy > 2 * v.size.y || (dy > v.size.y / 2 && (sy < 1 || sy >= surface.size.y - v.size.y))) {
      const v2 = v.moveTo(xy(v.x, Math.ceil((sy - this.visibleToSurfaceFactor.y/2) * this.surfaceToAllFactor.y)), this.all)
      if (!v2.equalTo(v)) {
        // console.log(` jump: ${v.y}->${v2.y} (${v2.y - v.y})`)
        this.visible = v = v2
        this.surface = surface = surface.moveTo(xy(surface.x, v2.y - thumb.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(v.x, y), this.all)
      if (!v2.equalTo(v)) {
        // console.log(` move: ${v.y}->${v2.y} (${v2.y - v.y})`)
        this.visible = v = v2
        // to adjust surface
      }
    }
  }

  protected rebaseSurface(): void {
    const z = this.surface.atZero()
    const scrollbarPixelStep = this.visibleToSurfaceFactor
    const logicalThumb = this.visible.scaleBy(this.allToSurfaceFactor)
    const optimum = logicalThumb.moveBy(
      xy(scrollbarPixelStep.x/2, scrollbarPixelStep.y/2), z)
    if (Math.abs(optimum.x - this.thumb.x) > scrollbarPixelStep.x/3) {
      const surface = this.surface
      const rebase = scrollbarPixelStep.x * ((surface.size.x*2/3 - logicalThumb.x) / surface.size.x)
      const t2 = this.thumb.moveTo(xy(logicalThumb.x + rebase, this.thumb.y), z)
      const s2 = surface.moveTo(xy(this.visible.x - t2.x, surface.y), this.all)
      if (!s2.equalTo(surface)) {
        this.surface = s2
        this.thumb = t2
      }
    }
    if (Math.abs(optimum.y - this.thumb.y) > scrollbarPixelStep.y/3) {
      const surface = this.surface
      const rebase = scrollbarPixelStep.y * ((surface.size.y*2/3 - logicalThumb.y) / surface.size.y)
      const t2 = this.thumb.moveTo(xy(this.thumb.x, logicalThumb.y + rebase), z)
      const s2 = surface.moveTo(xy(surface.x, this.visible.y - t2.y), this.all)
      if (!s2.equalTo(surface)) {
        // console.log(`rebase: ${rebase} // diff=${diff.y}, thumb=${t.y}->${t2.y}, surface=${s.y}->${s2.y}`)
        this.surface = s2
        this.thumb = t2
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
      const thumb = this.thumb
      if (Math.abs(thumb.x - c.scrollLeft) > 0.1)
        c.scrollLeft = thumb.x
      if (Math.abs(thumb.y - c.scrollTop) > 0.1)
        c.scrollTop = thumb.y
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
