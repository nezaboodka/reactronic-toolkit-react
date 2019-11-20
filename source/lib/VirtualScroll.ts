// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache, Monitor, passive, State, trigger } from 'reactronic'

import { Area, area, XY, xy } from './Area'

export const SURFACE_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
export const TARGET_GRID_SIZE_LIMIT: Area = area(0, 0, 899, 899)

export type Guide = { index: number, till: number }

export class Sizing {
  customCellWidth: Guide[] = [] // in pixels?
  customCellHeight: Guide[] = [] // in pixels?
}

export type IComponent = {
  readonly clientWidth: number
  readonly clientHeight: number
  readonly scrollWidth: number
  readonly scrollHeight: number
  scrollLeft: number
  scrollTop: number
}

type ScrollPos = { viewport: number, surface: number, thumb: number, stamp: number }

export class VirtualScroll extends State {
  allCells: Area
  component: IComponent | null | undefined = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  prev: XY = xy(0, 0)
  stamp: XY = xy(0, 0)
  bufferSize: XY = xy(1.0, 1.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  progressing = Monitor.create('scrolling', 35)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
    Cache.of(this.onScroll).setup({monitor: this.progressing})
  }

  @action
  setComponent(component: IComponent | null, fontSize: number): void {
    if (component) {
      this.component = component
      this.ppc = xy(fontSize * 8, fontSize)
      this.surface = this.all.truncateBy(SURFACE_SIZE_LIMIT)
      this.thumb = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.viewport = new Area(0, 0, component.clientWidth, component.clientHeight)
      this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
    }
    else {
      this.targetGrid = Area.ZERO
      this.viewport = Area.ZERO
      this.thumb = Area.ZERO
      this.surface = Area.ZERO
      this.ppc = xy(1, 1)
      this.component = undefined
    }
  }

  // Factors

  get pixelToCellFactor(): XY {
    const r = this.ppc
    return xy(1 / r.x, 1 / r.y)
  }

  get viewportToSurfaceFactor(): XY {
    const surface = this.surface
    const vp = this.viewport
    return xy(
      surface.size.x / (vp.size.x - 1),
      surface.size.y / (vp.size.y - 1))
  }

  get surfaceToViewportFactor(): XY {
    const vp2s = this.viewportToSurfaceFactor
    return xy(1 / vp2s.x, 1 / vp2s.y)
  }

  get surfaceToAllFactor(): XY {
    const all = this.all
    const surface = this.surface
    const vp = this.viewport
    return xy(
      all.size.x / (surface.size.x - vp.size.x),
      all.size.y / (surface.size.y - vp.size.y))
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1 / s2a.x, 1 / s2a.y)
  }

  get viewportToAllFactor(): XY {
    const all = this.all
    const vp = this.viewport
    return xy(
      all.size.x / (vp.size.x - 1),
      all.size.y / (vp.size.y - 1))
  }

  get allToViewportFactor(): XY {
    const vp2a = this.viewportToAllFactor
    return xy(1 / vp2a.x, 1 / vp2a.y)
  }

  // Areas (pixels)

  get all(): Area {
    return this.allCells.scaleBy(this.ppc)
  }

  get buffer(): Area {
    return this.bufferCells.scaleBy(this.ppc)
  }

  get ready(): Area {
    return this.readyCells.scaleBy(this.ppc)
  }

  // Areas (cells)

  get surfaceCells(): Area {
    return this.surface.scaleBy(this.pixelToCellFactor)
  }

  get bufferCells(): Area {
    const vpc = this.viewportCells
    const buf = vpc.zoomAt(vpc.center, this.bufferSize)
    return buf.roundToOuter().truncateBy(this.allCells)
  }

  get viewportCells(): Area {
    return this.viewport.scaleBy(this.pixelToCellFactor)
  }

  // Events

  @action
  onScroll(): void {
    const c = this.component
    if (c) {
      // console.log(`onscroll: ${c.scrollTop}`)
      const t = this.thumb
      const dpr = 1/devicePixelRatio
      if (Math.abs(t.y - c.scrollTop) > dpr || Math.abs(t.x - c.scrollLeft) > dpr)
        this.applyThumbPos(c.scrollLeft, c.scrollTop, false)
    }
  }

  setReadyCells(cells: Area): void {
    // console.log(`\nready: ${cells.y}..${cells.till.y}`)
    this.readyCells = cells
    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()
  }

  // Triggers

  @trigger
  protected adjustSurface(): void {
    if (!this.progressing.busy)
      passive(() => this.applyThumbPos(this.thumb.x, this.thumb.y, true))
  }

  @trigger
  protected syncThumbs(): void {
    const c = this.component
    if (c) {
      const thumb = this.thumb
      if (Math.abs(thumb.x - c.scrollLeft) > 0.1)
        c.scrollLeft = thumb.x
      if (Math.abs(thumb.y - c.scrollTop) > 0.1)
        c.scrollTop = thumb.y
    }
  }

  // Internal

  protected applyThumbPos(left: number, top: number, ready: boolean): void {
    // console.log(`\napply: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const s2a = this.surfaceToAllFactor
    const scrollPixelStep = this.viewportToSurfaceFactor
    const stamp = this.stamp
    let vp = this.viewport
    let surface = this.surface
    let thumb = this.thumb.moveTo(xy(left, top), surface.atZero())

    const x = VirtualScroll.getTargetPos(vp.x, vp.size.x,
      surface.x, surface.size.x, thumb.x, stamp.x,
      scrollPixelStep.x, s2a.x, ready)
    const y = VirtualScroll.getTargetPos(vp.y, vp.size.y,
      surface.y, surface.size.y, thumb.y, stamp.y,
      scrollPixelStep.y, s2a.y, ready)

    vp = vp.moveTo(xy(x.viewport, y.viewport), this.all)
    surface = surface.moveTo(xy(x.surface, y.surface), this.all)
    thumb = thumb.moveTo(xy(x.thumb, y.thumb), surface.atZero())
    if (!vp.equalTo(this.viewport))
      this.viewport = vp
    if (!surface.equalTo(this.surface))
      this.surface = surface
    if (!thumb.equalTo(this.thumb))
      this.thumb = thumb
    this.stamp = xy(x.stamp, y.stamp)
  }

  private static getTargetPos(existingViewport: number, viewportSize: number,
    surface: number, surfaceSize: number, thumb: number, stamp: number,
    scrollbarPixelSize: number, surfaceToAllRatio: number, ready: boolean): ScrollPos {
    const now = Date.now()
    const p: ScrollPos = { viewport: surface + thumb, surface, thumb, stamp: 0 }
    const diff = Math.abs(p.viewport - existingViewport)
    const long = diff > 3 * viewportSize || now - stamp < 20 // ms
    if (long) {
      const fraction = 2 * (surfaceSize/2 - thumb) / surfaceSize
      p.viewport = (thumb - 4/5 * scrollbarPixelSize * fraction) * surfaceToAllRatio
      if (p.viewport < 0 || p.viewport + viewportSize >= surfaceSize * surfaceToAllRatio)
        p.viewport = thumb * surfaceToAllRatio
      p.surface = p.viewport - thumb
      p.stamp = now
      console.log(`long: thumb=${p.thumb}, viewport=${p.viewport}, surface=${p.surface}`)
    }
    else {
      const precise = p.viewport / surfaceToAllRatio
      const fraction = 2 * (surfaceSize/2 - precise) / surfaceSize
      const optimal = Math.ceil(precise + 4/5 * scrollbarPixelSize * fraction)
      surface = p.viewport - optimal
      if (thumb <= 0 || thumb >= surfaceSize - viewportSize ||
        (ready && Math.abs(optimal - thumb) > 1/3 * scrollbarPixelSize)) {
        if (surface < 0) {
          p.thumb = optimal + surface
          p.surface = 0
        }
        // else if (surface >= surfaceSize * surfaceToAllRatio - surfaceSize) {
        //   p.thumb = optimal - ((surfaceSize * surfaceToAllRatio - surfaceSize) - surface)
        //   p.surface = surfaceSize * surfaceToAllRatio - surfaceSize
        // }
        else {
          p.thumb = optimal
          p.surface = surface
        }
        console.log(`rebase: thumb=${thumb}->${p.thumb}, viewport=${p.viewport}, surface=${p.surface}, jump=${stamp}`)
      }
      else if (existingViewport !== p.viewport)
        console.log(`short: thumb=${p.thumb}, viewport=${p.viewport}, surface=${p.surface}`)
    }
    // if (vp !== result) console.log(`${jump ? 'jump' : 'shift'}: thumb=${thumb}, viewport=${vp}->${result}`)
    return p
  }
}
