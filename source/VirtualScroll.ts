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
  pxComponentArea: Area = Area.ZERO
  pxPerRow: number = 1
  pxViewport: Area = Area.ZERO
  preloadRatio: XY = xy(1.0, 2.0) // relative to view area

  constructor(sizeX: number, sizeY: number) {
    super()
    this.grid = area(0, 0, sizeX, sizeY)
  }

  @action
  setComponent(component: IComponent | null, pxPerRow: number): void {
    if (component) {
      this.component = component
      this.pxPerRow = pxPerRow
      this.pxViewport = new Area(0, 0, component.clientWidth, component.clientHeight)
    }
    else {
      this.pxViewport = Area.ZERO
      this.pxPerRow = 1
      this.component = undefined
    }
  }

  @trigger
  adjustComponentArea(): void {
    if (this.component) {
      let ca = this.pxComponentArea
      if (ca === Area.ZERO)
        ca = this.pxComponentArea = this.pxGrid.truncateBy(BROWSER_PIXEL_LIMIT)
      // const vp = this.pxViewport
      // const cps = this.componentPxPerScrollPx
      // const caSb = xy(ca.x / cps.x, ca.y / cps.y)
      // const vpSb = xy(vp.x / cps.x, vp.y / cps.y)
      // if (Math.abs(vpSb.y - caSb.y) > 0.5 || Math.abs(vpSb.x - caSb.x) > 0.5)
      //   ca = ca.moveCenterTo(vp.center, this.pxGrid)
      this.pxComponentArea = ca
    }
    else
      this.pxComponentArea = Area.ZERO
  }

  get gridToPx(): XY {
    const ppr = this.pxPerRow
    return xy(ppr * this.sizing.defaultColumnWidth, ppr)
  }

  get pxToGrid(): XY {
    const g2p = this.gridToPx
    return xy(1 / g2p.x, 1 / g2p.y)
  }

  get viewport(): Area {
    return this.pxViewport.zoomAt(Area.ZERO, this.pxToGrid)
  }

  get componentArea(): Area {
    return this.pxComponentArea.zoomAt(Area.ZERO, this.pxToGrid)
  }

  get preloadArea(): Area {
    const vp = this.viewport
    return vp.zoomAt(vp.center, this.preloadRatio).round().truncateBy(this.grid)
  }

  get pxPreloadArea(): Area {
    return this.preloadArea.zoomAt(Area.ZERO, this.gridToPx)
  }

  get pxPreloadMargin(): XY {
    return xy(
      this.pxPreloadArea.x - this.pxComponentArea.x,
      this.pxPreloadArea.y - this.pxComponentArea.y)
  }

  get pxGrid(): Area {
    return this.grid.zoomAt(Area.ZERO, this.gridToPx)
  }

  get componentPxPerScrollPx(): XY {
    return xy(
      this.pxComponentArea.size.x / this.pxViewport.size.x,
      this.pxComponentArea.size.y / this.pxViewport.size.y)
  }

  get componentScrollPosition(): XY {
    return xy(
      this.pxViewport.x - this.pxComponentArea.x,
      this.pxViewport.y - this.pxComponentArea.y)
  }

  @cached cachedPreloadArea(): Area {
    return this.preloadArea
  }

  @action
  scrollBy(delta: XY): void {
    // delta = new Area(delta.x, delta.y, 0, 0).scaleBy(this.deviceToPx)
    this.pxViewport = this.pxViewport.moveBy(delta, this.pxGrid)
  }

  @action
  onScroll(x: number, y: number): void {
    const vp = this.pxViewport
    const ca = this.pxComponentArea
    const prev = xy(vp.x - ca.x, vp.y - ca.y)
    const pos = xy(
      Math.abs(x - prev.x) > 2 * vp.size.x ? Math.ceil((ca.x + x) * (this.pxGrid.size.x / ca.size.x)) : ca.x + x,
      Math.abs(y - prev.y) > 2 * vp.size.y ? Math.ceil((ca.y + y) * (this.pxGrid.size.y / ca.size.y)) : ca.y + y)
    const vp2 = vp.moveTo(pos, this.pxGrid)
    if (!vp2.equalTo(vp)) {
      // const caSnap = ca.zoomAt(ca.center, xy(0.75, 0.75)).truncateBy(this.pxGrid)
      // if (!caSnap.contains(vp2.from) || !caSnap.contains(vp2.till)) {
      //   const ca2 = ca.moveCenterTo(vp2.center, this.pxGrid)
      //   if (!ca2.equalTo(ca))
      //     this.pxComponentArea = ca2
      // }
      this.pxViewport = vp2
    }
  }

  @action
  zoomAt(origin: XY, factor: number): void {
    origin = this.pxComponentArea.moveBy(origin, this.pxGrid)
    this.pxViewport = this.pxViewport.zoomAt(origin, xy(factor, factor))
  }
}

export function dumpArea(a: Area, fr?: number): string {
  return `${num(a.x, fr)}, ${num(a.y, fr)}, ${num(a.x + a.size.x - 1, fr)}, ${num(a.y + a.size.y - 1, fr)}`
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
