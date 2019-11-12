// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, trigger, Monitor, Cache } from 'reactronic'
import { XY, xy, Area, area, num } from './Area'

export const CANVAS_PIXEL_LIMIT: Area = area(0, 0, 1000123, 1000123)
export type GridLine = { index: number, coord: number }
export class GridSizing {
  defaultCellWidthFactor: number = 4 // measured in cell height ('em')
  customCellWidth: GridLine[] = [] // in pixels?
  customCellHeight: GridLine[] = [] // in pixels?
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
  grid: Area
  gridSizing = new GridSizing()
  element: IElement | null | undefined = undefined
  pixelsPerCell: number = 1
  canvas: Area = Area.ZERO
  canvasThumb: Area = Area.ZERO
  view: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 3.0)
  scrollingMonitor: Monitor = Monitor.create('scrolling', 20)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  @action
  setElement(element: IElement | null, pxPerCell: number): void {
    if (element) {
      this.element = element
      this.pixelsPerCell = pxPerCell
      this.canvas = this.all.truncateBy(CANVAS_PIXEL_LIMIT)
      this.canvasThumb = new Area(0, 0, element.clientWidth, element.clientHeight)
      Cache.of(this.moveViewport).setup({monitor: this.scrollingMonitor})
      this.view = new Area(0, 0, element.clientWidth, element.clientHeight)
    }
    else {
      this.view = Area.ZERO
      Cache.of(this.moveViewport).setup({monitor: null})
      this.canvasThumb = Area.ZERO
      this.canvas = Area.ZERO
      this.pixelsPerCell = 1
      this.element = undefined
    }
  }

  // Factors

  get cellToPixelFactor(): XY {
    const ppr = this.pixelsPerCell
    return xy(ppr * this.gridSizing.defaultCellWidthFactor, ppr)
  }

  get pixelToCellFactor(): XY {
    const c2g = this.cellToPixelFactor
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

  get canvasToAllFactor(): XY {
    const a = this.all.size
    const c = this.canvas.size
    const v = this.view.size
    return xy(a.x / (c.x - v.x), a.y / (c.y - v.y))
  }

  get allToCanvasFactor(): XY {
    const c2a = this.canvasToAllFactor
    return xy(1 / c2a.x, 1 / c2a.y)
  }

  get viewToAllFactor(): XY {
    const a = this.all.size
    const v = this.view.size
    return xy(a.x / (v.x - 1), a.y / (v.y - 1))
  }

  get allToViewFactor(): XY {
    const v2a = this.viewToAllFactor
    return xy(1 / v2a.x, 1 / v2a.y)
  }

  // Areas (pixels)

  get all(): Area {
    return this.grid.scaleBy(this.cellToPixelFactor)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.cellToPixelFactor)
  }

  getGap(cells: Area): XY {
    const a = cells.scaleBy(this.cellToPixelFactor)
    const c = this.canvas
    let dx = a.x - c.x
    if (dx < -a.size.x)
      dx = -a.size.x
    else if (dx + a.size.x > c.size.x)
      dx = c.size.x - a.size.x
    let dy = a.y - c.y
    if (dy < -a.size.y)
      dy = -a.size.y
    else if (dy + a.size.y > c.size.y)
      dy = c.size.y - a.size.y
    return xy(dx, dy)
  }

  // Areas (cells)

  get canvasCells(): Area {
    return this.canvas.scaleBy(this.pixelToCellFactor)
  }

  get bufferCells(): Area {
    const v = this.viewCells
    return v.zoomAt(v.center, this.bufferingFactor).floor().truncateBy(this.grid)
  }

  get viewCells(): Area {
    return this.view.scaleBy(this.pixelToCellFactor)
  }

  // Actions

  onScroll(): void {
    const element = this.element
    if (element) {
      const t = this.canvasThumb
      if (Math.abs(t.y - element.scrollTop) > 0.1 || Math.abs(t.x - element.scrollLeft) > 0.1)
        this.moveViewport(element.scrollLeft, element.scrollTop)
    }
  }

  @action
  moveViewport(cx: number, cy: number): void {
    // console.log(`scroll: ${cy} (∆ ${cy - this.canvasThumb.y}), h=${this.element ? this.element.scrollHeight : '?'}`)
    const c0 = this.canvas.moveTo(Area.ZERO, this.all)
    this.canvasThumb = this.canvasThumb.moveTo(xy(cx, cy), c0)
    const t = this.canvasThumb
    let c = this.canvas
    let v = this.view
    const x = c.x + t.x
    const y = c.y + t.y
    const c2a = this.canvasToAllFactor
    const dx = Math.abs(x - v.x)
    if (dx > 2 * v.size.x || (dx > v.size.x / 2 && (cx < 1 || cx >= c.size.x - v.size.x))) {
      const v2 = v.moveTo(xy(Math.ceil(cx * c2a.x), v.y), this.all)
      if (!v2.equalTo(v)) {
        v = this.view = v2
        c = this.canvas = c.moveTo(xy(v2.x - t.x, c.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(x, v.y), this.all)
      if (!v2.equalTo(v))
        this.view = v2
    }
    const dy = Math.abs(y - v.y)
    if (dy > 2 * v.size.y || (dy > v.size.y / 2 && (cy < 1 || cy >= c.size.y - v.size.y))) {
      const v2 = v.moveTo(xy(v.x, Math.ceil(cy * c2a.y)), this.all)
      if (!v2.equalTo(v)) {
        v = this.view = v2
        c = this.canvas = c.moveTo(xy(c.x, v2.y - t.y), this.all)
      }
    }
    else {
      const v2 = v.moveTo(xy(v.x, y), this.all)
      if (!v2.equalTo(v))
        this.view = v2
    }
  }

  @trigger
  rebaseCanvas(): void {
    const element = this.element
    if (element && !this.scrollingMonitor.busy) {
      // console.log('rebase')
      let c = this.canvas
      let t = this.canvasThumb
      const v = this.view
      const v2c = this.viewToCanvasFactor
      const precise = v.scaleBy(this.allToCanvasFactor)
      const median = xy(precise.x + v2c.x/2, precise.y + v2c.y/2)
      const diff = xy(t.x - median.x, t.y - median.y)
      if (Math.abs(diff.x) > v2c.x/3) {
        const tip = v2c.x * ((c.size.x / 2 - precise.x) / c.size.x)
        const t2 = t.moveTo(xy(precise.x + tip, t.y), c.moveTo(Area.ZERO, this.all))
        const c2 = c.moveTo(xy(v.x - t2.x, c.y), this.all)
        if (!c2.equalTo(c)) {
          this.canvas = c = c2
          this.canvasThumb = t = t2
        }
      }
      if (Math.abs(diff.y) > v2c.y/3) {
        const tip = v2c.y * ((c.size.y / 2 - precise.y) / c.size.y)
        const t2 = t.moveTo(xy(t.x, precise.y + tip), c.moveTo(Area.ZERO, this.all))
        const c2 = c.moveTo(xy(c.x, v.y - t2.y), this.all)
        if (!c2.equalTo(c)) {
          this.canvas = c = c2
          this.canvasThumb = t = t2
        }
      }
    }
  }

  @trigger
  syncCanvasThumbWithElement(): void {
    const element = this.element
    if (element) {
      const t = this.canvasThumb
      if (Math.abs(t.x - element.scrollLeft) > 0.1)
        element.scrollLeft = t.x
      if (Math.abs(t.y - element.scrollTop) > 0.1)
        element.scrollTop = t.y
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.canvas.moveBy(origin, this.all)
    this.view = this.view.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}
