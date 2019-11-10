// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached, trigger, Monitor, Cache } from 'reactronic'
import { XY, xy, Area, area, num } from './Area'

export const CANVAS_PIXEL_LIMIT: Area = area(0, 0, 1000123, 1000123)
export type GridLine = { index: number, coord: number }
export class GridSizing {
  defaultCellWidthFactor: number = 4 // measured in cell height ('em')
  customCellWidth: GridLine[] = [] // in pixels?
  customCellHeight: GridLine[] = [] // in pixels?
}

export type IDevice = {
  readonly clientWidth: number
  readonly clientHeight: number
  readonly scrollWidth: number
  readonly scrollHeight: number
  scrollLeft: number
  scrollTop: number
}

export class Viewport extends State {
  grid: Area
  gridSizing = new GridSizing()
  device: IDevice | null | undefined = undefined
  pixelsPerCell: number = 1
  canvas: Area = Area.ZERO
  canvasThumb: Area = Area.ZERO
  view: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 2.0)
  scrollingMonitor: Monitor = Monitor.create('scrolling', 20)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  @action
  setDevice(device: IDevice | null, pxPerCell: number): void {
    if (device) {
      this.device = device
      this.pixelsPerCell = pxPerCell
      this.canvas = this.global.truncateBy(CANVAS_PIXEL_LIMIT)
      this.canvasThumb = new Area(0, 0, device.clientWidth, device.clientHeight)
      Cache.of(this.moveThumbAndViewport).setup({monitor: this.scrollingMonitor})
      this.view = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.view = Area.ZERO
      Cache.of(this.moveThumbAndViewport).setup({monitor: null})
      this.canvasThumb = Area.ZERO
      this.canvas = Area.ZERO
      this.pixelsPerCell = 1
      this.device = undefined
    }
  }

  // Factors

  get cellToGlobalFactor(): XY {
    const ppr = this.pixelsPerCell
    return xy(ppr * this.gridSizing.defaultCellWidthFactor, ppr)
  }

  get globalToCellFactor(): XY {
    const c2g = this.cellToGlobalFactor
    return xy(1 / c2g.x, 1 / c2g.y)
  }

  get viewToCanvasFactor(): XY {
    const c = this.canvas.size
    const v = this.view.size
    return xy(c.x / (v.x - 1), c.y / (v.y - 1))
  }

  get canvasToViewFactor(): XY {
    const v2c = this.viewToCanvasFactor
    return xy(1 / v2c.x, 1 / v2c.y)
  }

  get canvasToGlobalFactor(): XY {
    const g = this.global.size
    const c = this.canvas.size
    const v = this.view.size
    return xy(g.x / (c.x - v.x), g.y / (c.y - v.y))
  }

  get globalToCanvasFactor(): XY {
    const c2g = this.canvasToGlobalFactor
    return xy(1 / c2g.x, 1 / c2g.y)
  }

  get viewToGlobalFactor(): XY {
    const g = this.global.size
    const v = this.view.size
    return xy(g.x / (v.x - 1), g.y / (v.y - 1))
  }

  get globalToViewFactor(): XY {
    const v2g = this.viewToGlobalFactor
    return xy(1 / v2g.x, 1 / v2g.y)
  }

  // Areas (pixels)

  get global(): Area {
    return this.grid.scaleBy(this.cellToGlobalFactor)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.cellToGlobalFactor)
  }

  get bufferGap(): XY {
    const buf = this.buffer
    const c = this.canvas
    return xy(buf.x - c.x, buf.y - c.y)
  }

  // Areas (cells)

  get canvasCells(): Area {
    return this.canvas.scaleBy(this.globalToCellFactor)
  }

  get bufferCells(): Area {
    // return this.buffer.zoomAt(Area.ZERO, this.pixelToCellRatio)
    const v = this.viewCells
    return v.zoomAt(v.center, this.bufferingFactor).floor().truncateBy(this.grid)
  }

  get viewCells(): Area {
    return this.view.scaleBy(this.globalToCellFactor)
  }

  // Actions

  handleDeviceScroll(): void {
    const device = this.device
    if (device) {
      const t = this.canvasThumb
      if (Math.abs(t.y - device.scrollTop) > 0.1 || Math.abs(t.x - device.scrollLeft) > 0.1)
        this.moveThumbAndViewport(device.scrollLeft, device.scrollTop)
    }
  }

  @action
  moveThumbAndViewport(cx: number, cy: number): void {    const c0 = this.canvas.moveTo(Area.ZERO, this.global)
    this.canvasThumb = this.canvasThumb.moveTo(xy(cx, cy), c0)
    const t = this.canvasThumb
    let c = this.canvas
    let v = this.view
    const x = c.x + t.x
    const y = c.y + t.y
    const c2a = this.canvasToGlobalFactor
    if (Math.abs(x - v.x) > 2 * v.size.x || cx === 0 || cx >= c.size.x - v.size.x) {
      const v2 = v.moveTo(xy(Math.ceil(cx * c2a.x), v.y), this.global)
      if (!v2.equalTo(v)) {
        v = this.view = v2
        c = this.canvas = c.moveTo(xy(v2.x - t.x, c.y), this.global)
      }
    }
    else {
      const v2 = v.moveTo(xy(x, v.y), this.global)
      if (!v2.equalTo(v))
        this.view = v2
    }
    if (Math.abs(y - v.y) > 2 * v.size.y || cy === 0 || cy >= c.size.y - v.size.y) {
      const v2 = v.moveTo(xy(v.x, Math.ceil(cy * c2a.y)), this.global)
      if (!v2.equalTo(v)) {
        v = this.view = v2
        c = this.canvas = c.moveTo(xy(c.x, v2.y - t.y), this.global)
      }
    }
    else {
      const v2 = v.moveTo(xy(v.x, y), this.global)
      if (!v2.equalTo(v))
        this.view = v2
    }
  }

  @trigger
  rebaseCanvas(): void {
    const device = this.device
    if (device && !this.scrollingMonitor.busy) {
      let c = this.canvas
      let t = this.canvasThumb
      const v = this.view
      const v2c = this.viewToCanvasFactor
      const precise = v.scaleBy(this.globalToCanvasFactor)
      const median = xy(precise.x + v2c.x/2, precise.y + v2c.y/2)
      const diff = xy(t.x - median.x, t.y - median.y)
      if (Math.abs(diff.x) > v2c.x/3) {
        const t2 = t.moveTo(xy(precise.x + v2c.x/2, t.y), c.moveTo(Area.ZERO, this.global))
        const c2 = c.moveTo(xy(v.x - t2.x, c.y), this.global)
        if (!c2.equalTo(c)) {
          this.canvas = c = c2
          this.canvasThumb = t = t2
        }
      }
      if (Math.abs(diff.y) > v2c.y/3) {
        const t2 = t.moveTo(xy(t.x, precise.y + v2c.y/2), c.moveTo(Area.ZERO, this.global))
        const c2 = c.moveTo(xy(c.x, v.y - t2.y), this.global)
        if (!c2.equalTo(c)) {
          this.canvas = c = c2
          this.canvasThumb = t = t2
        }
      }
    }
  }

  @trigger
  syncCanvasThumbWithDevice(): void {
    const device = this.device
    if (device) {
      const t = this.canvasThumb
      if (Math.abs(t.x - device.scrollLeft) > 0.1)
        device.scrollLeft = t.x
      if (Math.abs(t.y - device.scrollTop) > 0.1)
        device.scrollTop = t.y
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.canvas.moveBy(origin, this.global)
    this.view = this.view.zoomAt(origin, xy(factor, factor))
  }

  // Temporary

  @cached bufferedCellsWorkaround(): Area {
    return this.bufferCells
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
