// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached, trigger } from 'reactronic'
import { XY, xy, Area, area } from './Area'

export const BROWSER_PIXEL_LIMIT: Area = area(0, 0, 1000008, 1000008)
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
  globalCells: Area
  sizing = new Sizing()
  device: IDevice | null | undefined = undefined
  pixelsPerCell: number = 1
  canvas: Area = Area.ZERO
  thumb: Area = Area.ZERO // relative to canvas
  viewport: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 2.0) // viewport-based

  constructor(sizeX: number, sizeY: number) {
    super()
    this.globalCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setDevice(device: IDevice | null, pxPerCell: number): void {
    if (device) {
      this.device = device
      this.pixelsPerCell = pxPerCell
      this.canvas = this.global.truncateBy(BROWSER_PIXEL_LIMIT)
      this.thumb = new Area(0, 0, device.clientWidth, device.clientHeight)
      this.viewport = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
      this.thumb = Area.ZERO
      this.canvas = Area.ZERO
      this.pixelsPerCell = 1
      this.device = undefined
    }
  }

  // Ratios

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

  // Areas

  get global(): Area {
    return this.globalCells.scaleBy(this.cellToGlobalFactor)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.globalToCellFactor)
  }

  get bufferCells(): Area {
    // return this.buffer.zoomAt(Area.ZERO, this.pixelToCellRatio)
    const v = this.viewportCells
    return v.zoomAt(v.center, this.bufferingFactor).round().truncateBy(this.globalCells)
  }

  get buffer(): Area {
    // const vp = this.viewport
    // return vp.zoomAt(vp.center, this.bufferingFactor).truncateBy(this.global)
    return this.bufferCells.scaleBy(this.cellToGlobalFactor)
  }

  get gap(): XY {
    const buf = this.buffer
    const c = this.canvas
    return xy(buf.x - c.x, buf.y - c.y)
  }

  get canvasCells(): Area {
    return this.canvas.scaleBy(this.globalToCellFactor)
  }

  @cached bufferCellsWorkaround(): Area {
    return this.bufferCells
  }

  // Actions

  @action
  scrollBy(delta: XY): void {
    this.viewport = this.viewport.moveBy(delta, this.global)
  }

  @action
  moveThumb(x: number, y: number): void {
    const t = this.thumb
    if (t.y !== y || t.x !== x) {
      this.thumb = t.moveTo(xy(x, y), this.canvas)
      const c = this.canvas
      const c2a = this.canvasToGlobalFactor
      const v = this.viewport
      const v2 = v.moveTo(xy(
        Math.abs(c.x + x - v.x) < v.size.x ? c.x + x : Math.ceil((c.x + x) * c2a.x),
        Math.abs(c.y + y - v.y) < v.size.y ? c.y + y : Math.ceil((c.y + y) * c2a.y)), this.global)
      if (!v2.equalTo(v)) // prevent recursion
        this.viewport = v2
    }
  }

  @trigger
  syncThumbWithDeviceScrollPosition(): void {
    const d = this.device
    const t = this.thumb
    if (d) {
      if (t.x !== d.scrollLeft)
        d.scrollLeft = t.x
      if (t.y !== d.scrollTop)
        d.scrollTop = t.y
    }
  }

  @trigger
  rebaseCanvas(): void {
    const t = this.thumb
    const v = this.viewport
    const canvasThumb = t.scaleBy(this.canvasToViewportFactor)
    const globalThumb = v.scaleBy(this.globalToViewportFactor)
    const delta = xy(canvasThumb.x - globalThumb.x, canvasThumb.y - globalThumb.y)
    if (delta.y > 1.0 || delta.y < 0 || delta.x > 1.0 || delta.x < 0) {
      console.log(`canvas thumb: ${num(canvasThumb.y, 15)}`)
      console.log(`global thumb: ${num(globalThumb.y, 15)}\n`)
    }

    // const t2 = xy(v.x - c.x, v.y - c.y)
    // if (t2.y !== t.y || t2.x !== t.x) {
    //   // const bounds = this.viewportToCanvasFactor
    //   console.log(`thumb: ${num(t.y, 15)}`)
    //   console.log(`pos: ${num(t2.y, 15)}`)
    //   d.scrollTop = t2.y
    //   d.scrollLeft = t2.x
    // }
    // // const v2c = this.viewportToCanvasFactor
    // // const actual = vp2.zoomAt(Area.ZERO, v2c)
    // const c2v = this.canvasToViewportFactor
    // const a2v = this.globalToViewportFactor
    // const sb1 = area(x, y, 0, 0).zoomAt(Area.ZERO, c2v)
    // const sb2 = area(x, y, 0, 0).zoomAt(Area.ZERO, a2v)
    // const cx = sb1.x - sb2.x
    // const cy = sb1.y - sb2.y
    // if (cy > 0.9 || cy < 0 || cx > 0.9 || cy < 0) {
    //   const actual = vp2.zoomAt(Area.ZERO, a2v)
    //   const shift = xy(x - actual.x, y - actual.y)
    //   const comp2 = comp.moveBy(shift, this.global)
    //   if (!comp2.equalTo(comp)) {
    //     console.log(`p: (${num(x)}, ${num(y)}) -> (${num(actual.x, 15)}, ${num(actual.y, 15)})`)
    //     console.log(`c: (${num(sb1.x, 15)}, ${num(sb1.y, 15)})`)
    //     console.log(`a: (${num(sb2.x, 15)}, ${num(sb2.y, 15)})`)
    //     this.canvas = comp2
    //     if (this.device) {
    //       if (this.device.scrollLeft !== actual.x)
    //         this.device.scrollLeft = actual.x
    //       if (this.device.scrollTop !== actual.y)
    //         this.device.scrollTop = actual.y
    //     }
    //   }
    // }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.canvas.moveBy(origin, this.global)
    this.viewport = this.viewport.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
