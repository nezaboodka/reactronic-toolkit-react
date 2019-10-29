// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached } from 'reactronic'
import { XY, xy, Area, area, ZERO } from './Area'

export const PX_RENDERING_LIMIT: Area = area(0, 0, 1000008, 1000008)

export type GridLine = { index: number, coord: number }

export class Sizing {
  defaultCellSizeX: number = 4 // measured in cell height ('em')
  customCellSizeX: GridLine[] = []
  customCellSizeY: GridLine[] = []
}

export type IComponent = {
  readonly clientWidth: number
  readonly clientHeight: number
  scrollLeft: number
  scrollTop: number
}

export class VirtualScroll extends State {
  grid: Area
  sizing = new Sizing()
  component: IComponent | null | undefined = undefined
  pxPerCell: number = 16
  pxViewArea: Area = ZERO
  dataAreaRatio: XY = xy(1.0, 2.0) // relative to viewport

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

  get renderToPx(): XY {
    return xy(
      this.pxGrid.size.x / this.pxDeviceArea.size.x,
      this.pxGrid.size.y / this.pxDeviceArea.size.y)
  }

  get viewArea(): Area {
    return this.pxViewArea.zoomAt(ZERO, this.pxToGrid)
  }

  get deviceArea(): Area {
    return this.pxDeviceArea.zoomAt(ZERO, this.pxToGrid)
  }

  get pxDeviceArea(): Area {
    return this.pxGrid.truncateBy(PX_RENDERING_LIMIT)
  }

  @cached
  dataArea(): Area {
    const center = this.viewArea.getCenter()
    return this.viewArea.zoomAt(center, this.dataAreaRatio).round().truncateBy(this.grid)
  }

  get pxDataArea(): Area {
    return this.dataArea().zoomAt(ZERO, this.gridToPx)
  }

  get pxGrid(): Area {
    return this.grid.zoomAt(ZERO, this.gridToPx)
  }

  @action
  setComponent(component: IComponent | null): void {
    if (component) {
      this.component = component
      this.pxViewArea = new Area(0, 0, component.clientWidth, component.clientHeight)
    }
    else {
      this.component = undefined
    }
  }

  @action
  scrollBy(delta: XY): void {
    // delta = new Area(delta.x, delta.y, 0, 0).scaleBy(this.deviceToPx)
    this.pxViewArea = this.pxViewArea.moveBy(delta)
  }

  @action
  scrollTo(pos: XY): XY {
    const vp = this.pxViewArea
    const device = this.pxDeviceArea
    const result = area(device.x + pos.x, device.y + pos.y, vp.size.x, vp.size.y)
    if (!vp.isIntersectedWith(result)) {
      // result = area(pos.x, pos.y, 0, 0).zoomAt(ZERO, this.renderToPx).resize(vp.size)
      // this.pxRenderArea = area(
      //   result.x - Math.round(device.size.x / 2),
      //   Math.round(result.y - device.size.y / 2),
      //   device.size.x,
      //   device.size.y)
    }
    this.pxViewArea = result
    return result
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = area(origin.x, origin.y, 1, 1).zoomAt(ZERO, this.renderToPx)
    this.pxViewArea = this.pxViewArea.zoomAt(origin, xy(factor, factor))
  }

  toString(): string {
    return `
device: ${this.pxDeviceArea.size.x}px * ${this.pxDeviceArea.size.y}px
grid: ${this.grid.size.x}c * ${this.grid.size.y}r (${this.pxGrid.size.x}px * ${this.pxGrid.size.y}px)
viewport: ${dumpArea(this.viewArea)} (px: ${dumpArea(this.pxViewArea)})
dataport: ${dumpArea(this.dataArea())} (px: ${dumpArea(this.pxDataArea)})
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
