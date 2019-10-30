// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { State, action, cached, trigger } from 'reactronic'
import { XY, xy, Area, area } from './Area'

export const BROWSER_PIXEL_LIMIT: Area = area(0, 0, 1000008, 1000008)
export type GridLine = { index: number, coord: number }

export class Sizing {
  defaultColumnWidth: number = 4 // measured in cell height ('em')
  customColumnWidths: GridLine[] = [] // in pixels?
  customRowHeights: GridLine[] = [] // in pixels?
}

export type IComponent = {
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
  component: IComponent | null | undefined = undefined
  componentAreaPixels: Area = Area.ZERO
  pixelsPerRow: number = 1
  viewportPixels: Area = Area.ZERO
  preloadRatio: XY = xy(1.0, 2.0) // relative to view area

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponent(component: IComponent | null, pxPerRow: number): void {
    if (component) {
      this.component = component
      this.pixelsPerRow = pxPerRow
      this.viewportPixels = new Area(0, 0, component.clientWidth, component.clientHeight)
    }
    else {
      this.viewportPixels = Area.ZERO
      this.pixelsPerRow = 1
      this.component = undefined
    }
  }

  @trigger
  adjustComponentArea(): void {
    this.componentAreaPixels = this.component ?
      this.gridPixels.truncateBy(BROWSER_PIXEL_LIMIT) :
      Area.ZERO
  }

  get gridToPixelRatio(): XY {
    const ppr = this.pixelsPerRow
    return xy(ppr * this.sizing.defaultColumnWidth, ppr)
  }

  get pixelToGridRatio(): XY {
    const g2p = this.gridToPixelRatio
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get viewport(): Area {
    return this.viewportPixels.zoomAt(Area.ZERO, this.pixelToGridRatio)
  }

  get preloadArea(): Area {
    const vp = this.viewport
    return vp.zoomAt(vp.center, this.preloadRatio).round().truncateBy(this.grid)
  }

  get preloadAreaPixels(): Area {
    return this.preloadArea.zoomAt(Area.ZERO, this.gridToPixelRatio)
  }

  get componentArea(): Area {
    return this.componentAreaPixels.zoomAt(Area.ZERO, this.pixelToGridRatio)
  }

  get componentGapPixels(): XY {
    return xy(
      this.preloadAreaPixels.x - this.componentAreaPixels.x,
      this.preloadAreaPixels.y - this.componentAreaPixels.y)
  }

  get componentPixelPerScrollPixel(): XY {
    return xy(
      this.componentAreaPixels.size.x / this.viewportPixels.size.x,
      this.componentAreaPixels.size.y / this.viewportPixels.size.y)
  }

  get componentScrollPixel(): XY {
    return xy(
      this.viewportPixels.x - this.componentAreaPixels.x,
      this.viewportPixels.y - this.componentAreaPixels.y)
  }

  get gridPixels(): Area {
    return this.grid.zoomAt(Area.ZERO, this.gridToPixelRatio)
  }

  @cached cachedPreloadArea(): Area {
    return this.preloadArea
  }

  @action
  scrollBy(delta: XY): void {
    // delta = new Area(delta.x, delta.y, 0, 0).scaleBy(this.deviceToPx)
    this.viewportPixels = this.viewportPixels.moveBy(delta, this.gridPixels)
  }

  @action
  onScroll(x: number, y: number): void {
    const vp = this.viewportPixels
    const ca = this.componentAreaPixels
    const prev = xy(vp.x - ca.x, vp.y - ca.y)
    const pos = xy(
      Math.abs(x - prev.x) > 2 * vp.size.x ? Math.ceil((ca.x + x) * (this.gridPixels.size.x / ca.size.x)) : ca.x + x,
      Math.abs(y - prev.y) > 2 * vp.size.y ? Math.ceil((ca.y + y) * (this.gridPixels.size.y / ca.size.y)) : ca.y + y)
    const vp2 = vp.moveTo(pos, this.gridPixels)
    if (!vp2.equalTo(vp)) {
      const caSnap = ca.zoomAt(ca.center, xy(0.75, 0.75)).truncateBy(this.gridPixels)
      if (!caSnap.contains(vp2.from) || !caSnap.contains(vp2.till)) {

        // const ca2 = ca.moveCenterTo(vp2.center, this.pxGrid)
        // if (!ca2.equalTo(ca))
        //   this.pxComponentArea = ca2
      }
      this.viewportPixels = vp2
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.componentAreaPixels.moveBy(origin, this.gridPixels)
    this.viewportPixels = this.viewportPixels.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `${num(a.x, fr)}, ${num(a.y, fr)}, ${num(a.x + a.size.x - 1, fr)}, ${num(a.y + a.size.y - 1, fr)}`
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
