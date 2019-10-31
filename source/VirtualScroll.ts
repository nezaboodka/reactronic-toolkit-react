// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached } from 'reactronic'
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
  component: Area = Area.ZERO
  pixelsPerCell: number = 1
  viewport: Area = Area.ZERO
  bufferingFactor: XY = xy(1.0, 2.0) // from viewport

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponentDevice(device: IDevice | null, pxPerCell: number): void {
    if (device) {
      this.device = device
      this.pixelsPerCell = pxPerCell
      this.component = this.all.truncateBy(BROWSER_PIXEL_LIMIT)
      this.viewport = new Area(0, 0, device.clientWidth, device.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
      this.component = Area.ZERO
      this.pixelsPerCell = 1
      this.device = undefined
    }
  }

  // Ratios

  get cellToPixelRatio(): XY {
    const ppr = this.pixelsPerCell
    return xy(ppr * this.sizing.defaultCellWidthFactor, ppr)
  }

  get pixelToCellRatio(): XY {
    const g2p = this.cellToPixelRatio
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get viewportToComponentRatio(): XY {
    const comp = this.component.size
    const vp = this.viewport.size
    return xy(comp.x / (vp.x - 1), comp.y / (vp.y - 1))
  }

  get componentToViewportRatio(): XY {
    const v2c = this.viewportToComponentRatio
    return xy(1 / v2c.x, 1 / v2c.y)
  }

  get componentToAllRatio(): XY {
    const all = this.all.size
    const vp = this.viewport.size
    const comp = this.component.size
    return xy(all.x / (comp.x - vp.x), all.y / (comp.y - vp.y))
  }

  get viewportToAllRatio(): XY {
    const all = this.all.size
    const vp = this.viewport.size
    return xy(all.x / (vp.x - 1), all.y / (vp.y - 1))
  }

  // Areas

  get all(): Area {
    return this.allCells.zoomAt(Area.ZERO, this.cellToPixelRatio)
  }

  get viewportCells(): Area {
    return this.viewport.zoomAt(Area.ZERO, this.pixelToCellRatio)
  }

  get bufferCells(): Area {
    // return this.buffer.zoomAt(Area.ZERO, this.pixelToCellRatio)
    const vp = this.viewportCells
    return vp.zoomAt(vp.center, this.bufferingFactor).round().truncateBy(this.allCells)
  }

  get buffer(): Area {
    // const vp = this.viewport
    // return vp.zoomAt(vp.center, this.bufferingFactor).truncateBy(this.all)
    return this.bufferCells.zoomAt(Area.ZERO, this.cellToPixelRatio)
  }

  get gap(): XY {
    const buf = this.buffer
    const comp = this.component
    return xy(buf.x - comp.x, buf.y - comp.y)
  }

  get componentCells(): Area {
    return this.component.zoomAt(Area.ZERO, this.pixelToCellRatio)
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
    const vp = this.viewport
    const comp = this.component
    const dx = comp.x + x - vp.x
    const dy = comp.y + y - vp.y
    if (dy !== 0 || dx !== 0) { // prevent recursion
      const c2a = this.componentToAllRatio
      const pos = xy(
        Math.abs(dx) < 2 * vp.size.x ? vp.x + dx : Math.ceil(x * c2a.x),
        Math.abs(dy) < 2 * vp.size.y ? vp.y + dy : Math.ceil(y * c2a.y))
      const vp2 = vp.moveTo(pos, this.all)
      if (!vp2.equalTo(vp)) {
        this.viewport = vp2
        const v2c = this.viewportToComponentRatio
        const gap = this.gap
        if (gap.y < 0 || gap.y >= v2c.y || gap.x < 0 || gap.x >= v2c.x) {
          const comp2 = comp.moveBy(this.gap, this.all)
          if (!comp2.equalTo(comp)) {
            console.log(`comp: ${comp2.x}, ${comp2.y}`)
            this.component = comp2
            if (this.device) {
              this.device.scrollLeft = vp2.x - comp2.x
              this.device.scrollTop = vp2.y - comp2.y
            }
          }
        }
      }
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.component.moveBy(origin, this.all)
    this.viewport = this.viewport.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `${num(a.x, fr)}, ${num(a.y, fr)}, ${num(a.x + a.size.x - 1, fr)}, ${num(a.y + a.size.y - 1, fr)}`
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
