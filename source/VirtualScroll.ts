// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached } from 'reactronic'
import { XY, xy, Area, area, ZERO } from './Area'

export const PX_RENDERING_LIMIT: Area = area(0, 0, 1000008, 1000008)
export type GridLine = { index: number, coord: number }

export class Sizing {
  defaultColumnWidth: number = 4 // measured in cell height ('em')
  customColumnWidths: GridLine[] = [] // in pixels?
  customRowHeights: GridLine[] = [] // in pixels?
}

export type IDevice = {
  readonly clientWidth: number
  readonly clientHeight: number
  scrollLeft: number
  scrollTop: number
}

export class VirtualScroll extends State {
  grid: Area
  sizing = new Sizing()
  device: IDevice | null | undefined = undefined
  pxPerRow: number = 16
  pxViewArea: Area = ZERO
  dataPreloadRatio: XY = xy(1.0, 2.0) // relative to view area

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  @action
  setDevice(device: IDevice | null, pxPerRow: number): void {
    if (device) {
      this.device = device
      this.pxViewArea = new Area(0, 0, device.clientWidth, device.clientHeight)
      this.pxPerRow = pxPerRow
    }
    else {
      this.device = undefined
      this.pxViewArea = ZERO
      this.pxPerRow = 16
    }
  }

  get gridToPx(): XY {
    const ppr = this.pxPerRow
    return xy(ppr * this.sizing.defaultColumnWidth, ppr)
  }

  get pxToGrid(): XY {
    const g2p = this.gridToPx
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get viewArea(): Area {
    return this.pxViewArea.zoomAt(ZERO, this.pxToGrid)
  }

  get deviceArea(): Area {
    return this.pxDeviceArea.zoomAt(ZERO, this.pxToGrid)
  }

  get pxDeviceArea(): Area {
    return this.pxGrid.truncateBy(PX_RENDERING_LIMIT).moveTo(this.pxDataArea, this.pxGrid)
  }

  get dataArea(): Area {
    const center = this.viewArea.getCenter()
    return this.viewArea.zoomAt(center, this.dataPreloadRatio).round().truncateBy(this.grid)
  }

  get pxDataArea(): Area {
    return this.dataArea.zoomAt(ZERO, this.gridToPx)
  }

  get pxDataMargin(): XY {
    return xy(
      this.pxDataArea.x - this.pxDeviceArea.x,
      this.pxDataArea.y - this.pxDeviceArea.y)
  }

  get pxGrid(): Area {
    return this.grid.zoomAt(ZERO, this.gridToPx)
  }

  get devicePxPerScrollPx(): XY {
    return xy(
      this.pxDeviceArea.size.x / this.pxViewArea.size.x,
      this.pxDeviceArea.size.y / this.pxViewArea.size.y)
  }

  get deviceScrollPosition(): XY {
    return xy(
      this.pxViewArea.x - this.pxDeviceArea.x,
      this.pxViewArea.y - this.pxDeviceArea.y)
  }

  @cached cachedDataArea(): Area {
    return this.dataArea
  }

  @action
  scrollBy(delta: XY): void {
    // delta = new Area(delta.x, delta.y, 0, 0).scaleBy(this.deviceToPx)
    this.pxViewArea = this.pxViewArea.moveBy(delta)
  }

  @action
  onScroll(x: number, y: number): void {
    const vp = this.pxViewArea
    const device = this.pxDeviceArea
    const result = area(device.x + x, device.y + y, vp.size.x, vp.size.y)
    if (!result.equalTo(this.pxViewArea)) {
      this.pxViewArea = result
      // if (this.component) {
      //   const pos = this.pxDeviceScrollPosition
      //   if (this.component.scrollLeft !== pos.x) {
      //     this.component.scrollLeft = pos.x
      //   }
      //   if (this.component.scrollTop !== pos.y) {
      //     this.component.scrollTop = pos.y
      //   }
      // }
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.pxDeviceArea.moveBy(origin)
    this.pxViewArea = this.pxViewArea.zoomAt(origin, xy(factor, factor))
  }

  toString(): string {
    return `
device: ${this.pxDeviceArea.size.x}px * ${this.pxDeviceArea.size.y}px
grid: ${this.grid.size.x}c * ${this.grid.size.y}r (${this.pxGrid.size.x}px * ${this.pxGrid.size.y}px)
viewport: ${dumpArea(this.viewArea)} (px: ${dumpArea(this.pxViewArea)})
dataport: ${dumpArea(this.dataArea)} (px: ${dumpArea(this.pxDataArea)})
`
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `${num(a.x, fr)}, ${num(a.y, fr)}, ${num(a.x + a.size.x - 1, fr)}, ${num(a.y + a.size.y - 1, fr)}`
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
