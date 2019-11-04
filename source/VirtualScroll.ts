// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached, trigger, Monitor, Cache } from 'reactronic'
import { XY, xy, Area, area } from './Area'

export const CANVAS_PIXEL_LIMIT: Area = area(0, 0, 1000008, 1000008)
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
  scrollingMonitor: Monitor = Monitor.create('scrolling', 18)
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
      Cache.of(this.moveViewportAndThumb).setup({monitor: this.scrollingMonitor})
      this.viewport = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
      Cache.of(this.moveViewportAndThumb).setup({monitor: null})
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
    const v = this.viewport.size
    const c = this.canvas.size
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

  get gap(): XY { // between canvas and buffer
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
    if (t.y !== y || t.x !== x)
      this.moveViewportAndThumb(x, y, t)
  }

  @action
  moveViewportAndThumb(x: number, y: number, thumb: Area): void {
    console.log(`scroll: ${y}`)
    this.canvasThumb = thumb.moveTo(xy(x, y), this.canvas.moveTo(Area.ZERO, this.global))
    const canvas = this.canvas
    const p = xy(canvas.x + x, canvas.y + y)
    const v = this.viewport
    const c2a = this.canvasToGlobalFactor
    if (Math.abs(p.x - v.x) >= 2 * v.size.x || Math.abs(p.y - v.y) >= 2 * v.size.y)
      console.log('(!)')
    const v2 = v.moveTo(xy(
      Math.abs(p.x - v.x) < 2 * v.size.x ? p.x : Math.ceil(p.x * c2a.x),
      Math.abs(p.y - v.y) < 2 * v.size.y ? p.y : Math.ceil(p.y * c2a.y)), this.global)
    if (!v2.equalTo(v)) // prevent recursion
      this.viewport = v2
  }

  @trigger
  adjustDeviceThumb(): void {
    const d = this.device
    if (d && !this.scrollingMonitor.busy) {
      const v = this.viewport
      const ct = this.canvasThumb.scaleBy(this.canvasToViewportFactor)
      const gt = v.scaleBy(this.globalToViewportFactor)
      const delta = xy(ct.x - gt.x, ct.y - gt.y)
      if (delta.y >= 1.0 || delta.y < 0 || delta.x >= 1.0 || delta.x < 0) {
        const t1 = this.canvasThumb
        const t2 = v.scaleBy(this.globalToCanvasFactor).ceil()
        console.log(`canvas thumb pixel: ${num(ct.y, 15)} (${num(ct.size.y, 15)})`)
        console.log(`global thumb pixel: ${num(gt.y, 15)} (${num(gt.size.y, 15)})`)
        console.log(`          viewport: ${num(v.y, 15)} (${num(v.size.y, 15)})`)
        console.log(`                t1: ${num(t1.y, 15)} (${num(t1.size.y, 15)})`)
        console.log(`                t2: ${num(t2.y, 15)} (${num(t2.size.y, 15)})\n`)
        const shift = xy(t1.x - t2.x, t1.y - t2.y)
        this.canvasThumb = this.canvasThumb.moveTo(t2, this.global)
        this.canvas = this.canvas.moveBy(shift, this.global)
      }
      const t = this.canvasThumb
      if (t.x !== d.scrollLeft)
        d.scrollLeft = t.x
      if (t.y !== d.scrollTop)
        d.scrollTop = t.y
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

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
