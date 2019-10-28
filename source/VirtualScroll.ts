// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action } from 'reactronic'
import { XY, xy, Area, area, ZERO } from './Area'

export type GridLine = { index: number, coord: number }

export class Sizing {
  defaultCellSizeX: number = 4 // measured in cell height ('em')
  customCellSizeX: GridLine[] = []
  customCellSizeY: GridLine[] = []
}

export type IDevice = {
  readonly clientWidth: number
  readonly clientHeight: number
  scrollLeft: number
  scrollTop: number
  readonly scrollWidth: number
  readonly scrollHeight: number
}

export class VirtualScroll extends State {
  grid: Area
  sizing = new Sizing()
  pxPerCell: number = 1
  pxViewport: Area = ZERO
  dataportSize: XY = xy(1.0, 2.0) // relative to viewport
  device?: IDevice | null = undefined
  pxDevice: Area = ZERO

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  get gridToPx(): XY {
    const ppc = this.pxPerCell
    return xy(ppc * this.sizing.defaultCellSizeX, ppc)
  }

  get pxToGrid(): XY {
    const g2p = this.gridToPx
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get deviceToPx(): XY {
    return xy(
      this.pxGrid.size.x / this.pxDevice.size.x,
      this.pxGrid.size.y / this.pxDevice.size.y)
  }

  get viewport(): Area {
    return this.pxViewport.zoomAt(ZERO, this.pxToGrid).round()
  }

  get dataport(): Area {
    const center = this.viewport.getCenter()
    return this.viewport.zoomAt(center, this.dataportSize).round().truncateBy(this.grid)
  }

  get pxDataport(): Area {
    return this.dataport.zoomAt(ZERO, this.gridToPx)
  }

  get pxGrid(): Area {
    return this.grid.zoomAt(ZERO, this.gridToPx)
  }

  @action
  setDevice(device: IDevice | null): void {
    if (device) {
      this.device = device
      this.pxDevice = new Area(0, 0, device.scrollWidth, device.scrollHeight)
      this.pxPerCell = 32
      this.pxViewport = new Area(device.scrollLeft, device.scrollTop, device.clientWidth, device.clientHeight)
    }
    else {
      this.pxDevice = ZERO
      this.device = undefined
    }
  }

  @action
  scrollBy(delta: XY): void {
    // delta = new Area(delta.x, delta.y, 0, 0).scaleBy(this.deviceToPx)
    this.pxViewport = this.pxViewport.moveBy(delta)
  }

  @action
  scrollTo(pos: XY): XY {
    const vp = this.pxViewport
    const device = this.pxDevice
    let result = area(device.x + pos.x, device.y + pos.y, vp.size.x, vp.size.y)
    if (!vp.isIntersectedWith(result)) {
      result = area(pos.x, pos.y, 0, 0).zoomAt(ZERO, this.deviceToPx).resize(vp.size)
      this.pxDevice = area(
        result.x - Math.round(device.size.x / 2),
        Math.round(result.y - device.size.y / 2),
        device.size.x,
        device.size.y)
    }
    this.pxViewport = result
    return result
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = area(origin.x, origin.y, 1, 1).zoomAt(ZERO, this.deviceToPx)
    this.pxViewport = this.pxViewport.zoomAt(origin, xy(factor, factor))
  }

  toString(): string {
    return `
device: ${this.pxDevice.size.x}px * ${this.pxDevice.size.y}px
grid: ${this.grid.size.x}c * ${this.grid.size.y}r (${this.pxGrid.size.x}px * ${this.pxGrid.size.y}px)
viewport: ${dumpArea(this.viewport)} (px: ${dumpArea(this.pxViewport)})
dataport: ${dumpArea(this.dataport)} (px: ${dumpArea(this.pxDataport)})
`
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `${num(a.x, fr)}, ${num(a.y, fr)}, ${num(a.x + a.size.x - 1, fr)}, ${num(a.y + a.size.y - 1, fr)}`
}

export function num(n: number, fr?: number): string {
  return n.toFixed(fr).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
