// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached } from 'reactronic'
import { XY, xy, Area, area } from './Area'

export const BROWSER_PIXEL_LIMIT: Area = area(0, 0, 1000008, 1000008)
export type GridLine = { index: number, coord: number }

export class Sizing {
  defaultColumnWidth: number = 4 // measured in cell height ('em')
  customColumnWidths: GridLine[] = [] // in pixels?
  customRowHeights: GridLine[] = [] // in pixels?
}

export type IComponentDevice = {
  readonly clientWidth: number
  readonly clientHeight: number
  readonly scrollWidth: number
  readonly scrollHeight: number
  scrollLeft: number
  scrollTop: number
}

export class VirtualScroll extends State {
  gridCells: Area
  sizing = new Sizing()
  componentDevice: IComponentDevice | null | undefined = undefined
  component: Area = Area.ZERO
  pixelsPerRow: number = 1
  viewport: Area = Area.ZERO
  preloadRatio: XY = xy(1.0, 2.0) // relative to view area

  constructor(sizeX: number, sizeY: number) {
    super()
    this.gridCells = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponent(component: IComponentDevice | null, pxPerRow: number): void {
    if (component) {
      this.componentDevice = component
      this.pixelsPerRow = pxPerRow
      this.component = this.grid.truncateBy(BROWSER_PIXEL_LIMIT)
      this.viewport = new Area(0, 0, component.clientWidth, component.clientHeight)
    }
    else {
      this.viewport = Area.ZERO
      this.component = Area.ZERO
      this.pixelsPerRow = 1
      this.componentDevice = undefined
    }
  }

  get gridToPixelRatio(): XY {
    const ppr = this.pixelsPerRow
    return xy(ppr * this.sizing.defaultColumnWidth, ppr)
  }

  get pixelToGridRatio(): XY {
    const g2p = this.gridToPixelRatio
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get grid(): Area {
    return this.gridCells.zoomAt(Area.ZERO, this.gridToPixelRatio)
  }

  get viewportCells(): Area {
    return this.viewport.zoomAt(Area.ZERO, this.pixelToGridRatio)
  }

  get fetchCells(): Area {
    const vp = this.viewportCells
    return vp.zoomAt(vp.center, this.preloadRatio).round().truncateBy(this.gridCells)
  }

  get fetch(): Area {
    return this.fetchCells.zoomAt(Area.ZERO, this.gridToPixelRatio)
  }

  get gap(): XY {
    return xy(
      this.fetch.x - this.component.x,
      this.fetch.y - this.component.y)
  }

  get componentCells(): Area {
    return this.component.zoomAt(Area.ZERO, this.pixelToGridRatio)
  }

  get componentPixelPerScrollPixel(): XY {
    const component = this.component.size
    const scrollbar = this.viewport.size
    return xy(component.x / scrollbar.x, component.y / scrollbar.y)
  }

  get gridPixelPerScrollPixel(): XY {
    const grid = this.grid.size
    const scrollbar = this.viewport.size
    return xy(grid.x / scrollbar.x, grid.x / scrollbar.y)
  }

  @cached cachedPreloadArea(): Area {
    return this.fetchCells
  }

  @action
  scrollBy(delta: XY): void {
    this.viewport = this.viewport.moveBy(delta, this.grid)
  }

  @action
  onScroll(x: number, y: number): void {
    const vpx = this.viewport
    const cpx = this.component
    const dx = cpx.x + x - vpx.x
    const dy = cpx.y + y - vpx.y
    if (dy !== 0 || dx !== 0) { // prevent recursion
      const p2g = this.pixelToGridRatio
      const delta = xy(
        Math.abs(dx) < 2 * vpx.size.x ? dx : Math.ceil(dx * p2g.x),
        Math.abs(dy) < 2 * vpx.size.y ? dy : Math.ceil(dy * p2g.y))
      const vpx2 = vpx.moveBy(delta, this.grid)
      if (!vpx2.equalTo(vpx)) {
        if (!cpx.contains(vpx2.from) || !cpx.contains(vpx2.till)) {
          const cpx2 = cpx.moveCenterTo(vpx2.center, this.grid)
          if (!cpx2.equalTo(cpx)) {
            console.log(`cpx: ${cpx2.x}, ${cpx2.y}`)
            this.component = cpx2
            if (this.componentDevice) {
              this.componentDevice.scrollLeft = vpx2.x - cpx2.x
              this.componentDevice.scrollTop = vpx2.y - cpx2.y
            }
          }
        }
        this.viewport = vpx2
      }
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.component.moveBy(origin, this.grid)
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
