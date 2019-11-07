// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached, trigger, Monitor, Cache } from 'reactronic'
import { XY, xy, Area, area, num } from './Area'

export const CANVAS_PIXEL_LIMIT: Area = area(0, 0, 1000123, 1000123)
export type GridLine = { index: number, coord: number }

export class Sizing {
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

export class VirtualScroll extends State {
  grid: Area
  sizing = new Sizing()
  device: IDevice | null | undefined = undefined
  pixelsPerCell: number = 1
  canvas: Area = Area.ZERO
  canvasThumb: Area = Area.ZERO
  scrollingMonitor: Monitor = Monitor.create('scrolling', 20)
  // canvasThumbTimestamp: number = 0
  viewport: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 2.0) // viewport-based

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
      this.viewport = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
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
    return xy(ppr * this.sizing.defaultCellWidthFactor, ppr)
  }

  get globalToCellFactor(): XY {
    const g2p = this.cellToGlobalFactor
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get viewportToCanvasFactor(): XY {
    const c = this.canvas.size
    const vp = this.viewport.size
    return xy(c.x / (vp.x - 1), c.y / (vp.y - 1))
  }

  get canvasToViewportFactor(): XY {
    const v2c = this.viewportToCanvasFactor
    return xy(1 / v2c.x, 1 / v2c.y)
  }

  get canvasToGlobalFactor(): XY {
    const g = this.global.size
    const c = this.canvas.size
    const v = this.viewport.size
    return xy(g.x / (c.x - v.x), g.y / (c.y - v.y))
  }

  get globalToCanvasFactor(): XY {
    const c2a = this.canvasToGlobalFactor
    return xy(1 / c2a.x, 1 / c2a.y)
  }

  get viewportToGlobalFactor(): XY {
    const g = this.global.size
    const v = this.viewport.size
    return xy(g.x / (v.x - 1), g.y / (v.y - 1))
  }

  get globalToViewportFactor(): XY {
    const v2a = this.viewportToGlobalFactor
    return xy(1 / v2a.x, 1 / v2a.y)
  }

  // Areas (pixels)

  get global(): Area {
    return this.grid.scaleBy(this.cellToGlobalFactor)
  }

  get buffer(): Area {
    // const vp = this.viewport
    // return vp.zoomAt(vp.center, this.bufferingFactor).truncateBy(this.global)
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
    const v = this.viewportCells
    return v.zoomAt(v.center, this.bufferingFactor).floor().truncateBy(this.grid)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.globalToCellFactor)
  }

  // Actions

  handleDeviceScroll(x: number, y: number): void {
    const t = this.canvasThumb
    if (Math.abs(t.y - y) > 0.1 || Math.abs(t.x - x) > 0.1)
      this.moveThumbAndViewport(x, y)
  }

  @action
  moveThumbAndViewport(x2: number, y2: number): void {    const c0 = this.canvas.moveTo(Area.ZERO, this.global)
    this.canvasThumb = this.canvasThumb.moveTo(xy(x2, y2), c0)
    const t = this.canvasThumb
    let c = this.canvas
    let v = this.viewport
    const x = c.x + t.x
    const y = c.y + t.y
    const c2a = this.canvasToGlobalFactor
    if (Math.abs(x - v.x) > 2 * v.size.x) {
      const v2 = v.moveTo(xy(Math.ceil(x2 * c2a.x), v.y), this.global)
      if (!v2.equalTo(v)) {
        v = this.viewport = v2
        c = this.canvas = c.moveTo(xy(v2.x - t.x, c.y), this.global)
      }
    }
    else {
      const v2 = v.moveTo(xy(x, v.y), this.global)
      if (!v2.equalTo(v))
        this.viewport = v2
    }
    if (Math.abs(y - v.y) > 2 * v.size.y) {
      const v2 = v.moveTo(xy(v.x, Math.ceil(y2 * c2a.y)), this.global)
      if (!v2.equalTo(v)) {
        v = this.viewport = v2
        c = this.canvas = c.moveTo(xy(c.x, v2.y - t.y), this.global)
      }
    }
    else {
      const v2 = v.moveTo(xy(v.x, y), this.global)
      if (!v2.equalTo(v))
        this.viewport = v2
    }
  }

  @trigger
  rebaseCanvas(): void {
    const device = this.device
    if (device && !this.scrollingMonitor.busy) {
      let c = this.canvas
      let t = this.canvasThumb
      const v = this.viewport
      const v2c = this.viewportToCanvasFactor
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
    this.viewport = this.viewport.zoomAt(origin, xy(factor, factor))
  }

  // Temporary

  @cached bufferCellsWorkaround(): Area {
    return this.bufferCells
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
