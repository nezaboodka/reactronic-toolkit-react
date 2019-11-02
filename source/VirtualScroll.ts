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
  allCells: Area
  sizing = new Sizing()
  device: IDevice | null | undefined = undefined
  pixelsPerCell: number = 1
  canvas: Area = Area.ZERO
  thumb: XY = xy(0, 0) // relative to canvas
  viewport: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 2.0) // viewport-based

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setDevice(device: IDevice | null, pxPerCell: number): void {
    if (device) {
      this.device = device
      this.pixelsPerCell = pxPerCell
      this.canvas = this.all.truncateBy(BROWSER_PIXEL_LIMIT)
      this.viewport = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
      this.canvas = Area.ZERO
      this.pixelsPerCell = 1
      this.device = undefined
    }
  }

  // Ratios

  get cellToAllFactor(): XY {
    const ppr = this.pixelsPerCell
    return xy(ppr * this.sizing.defaultCellWidthFactor, ppr)
  }

  get allToCellFactor(): XY {
    const g2p = this.cellToAllFactor
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

  get canvasToAllFactor(): XY {
    const all = this.all.size
    const v = this.viewport.size
    const c = this.canvas.size
    return xy(all.x / (c.x - v.x), all.y / (c.y - v.y))
  }

  get allToCanvasFactor(): XY {
    const c2a = this.canvasToAllFactor
    return xy(1 / c2a.x, 1 / c2a.y)
  }

  get viewportToAllFactor(): XY {
    const all = this.all.size
    const v = this.viewport.size
    return xy(all.x / (v.x - 1), all.y / (v.y - 1))
  }

  get allToViewportFactor(): XY {
    const v2a = this.viewportToAllFactor
    return xy(1 / v2a.x, 1 / v2a.y)
  }

  // Areas

  get all(): Area {
    return this.allCells.scaleBy(this.cellToAllFactor)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.allToCellFactor)
  }

  get bufferCells(): Area {
    // return this.buffer.zoomAt(Area.ZERO, this.pixelToCellRatio)
    const v = this.viewportCells
    return v.zoomAt(v.center, this.bufferingFactor).round().truncateBy(this.allCells)
  }

  get buffer(): Area {
    // const vp = this.viewport
    // return vp.zoomAt(vp.center, this.bufferingFactor).truncateBy(this.all)
    return this.bufferCells.scaleBy(this.cellToAllFactor)
  }

  get gap(): XY {
    const buf = this.buffer
    const c = this.canvas
    return xy(buf.x - c.x, buf.y - c.y)
  }

  get canvasCells(): Area {
    return this.canvas.scaleBy(this.allToCellFactor)
  }

  @cached bufferCellsWorkaround(): Area {
    return this.bufferCells
  }

  // Actions

  @action
  scrollBy(delta: XY): void {
    this.viewport = this.viewport.moveBy(delta, this.all)
  }

  @action
  onScroll(x: number, y: number): void {
    const t = this.thumb
    if (t.y !== y || t.x !== x) {
      this.thumb = xy(x, y)
      const c = this.canvas
      const c2a = this.canvasToAllFactor
      const v = this.viewport
      const v2 = v.moveTo(xy(
        Math.abs(c.x + x - v.x) < v.size.x ? c.x + x : Math.ceil((c.x + x) * c2a.x),
        Math.abs(c.y + y - v.y) < v.size.y ? c.y + y : Math.ceil((c.y + y) * c2a.y)), this.all)
      if (!v2.equalTo(v)) // prevent recursion
        this.viewport = v2
    }
  }

  @trigger
  syncThumb(): void {
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
    // const c = this.canvas
    // const v = this.viewport

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
    // const a2v = this.allToViewportFactor
    // const sb1 = area(x, y, 0, 0).zoomAt(Area.ZERO, c2v)
    // const sb2 = area(x, y, 0, 0).zoomAt(Area.ZERO, a2v)
    // const cx = sb1.x - sb2.x
    // const cy = sb1.y - sb2.y
    // if (cy > 0.9 || cy < 0 || cx > 0.9 || cy < 0) {
    //   const actual = vp2.zoomAt(Area.ZERO, a2v)
    //   const shift = xy(x - actual.x, y - actual.y)
    //   const comp2 = comp.moveBy(shift, this.all)
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
    origin = this.canvas.moveBy(origin, this.all)
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
