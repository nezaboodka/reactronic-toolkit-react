// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, State, trigger } from 'reactronic'

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

type ScrollPos = { viewport: number, surface: number, thumb: number, jumping: number }

export class VirtualScroll extends State {
  allCells: Area
  component: IComponent | null | undefined = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  jumping: XY = xy(0, 0) // timestamp
  bufferSize: XY = xy(1.0, 1.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
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

  onScroll(): void {
    const c = this.component
    if (c) {
      const t = this.thumb
      if (Math.abs(t.y - c.scrollTop) > 1/devicePixelRatio ||
        Math.abs(t.x - c.scrollLeft) > 1/devicePixelRatio)
        this.scrollTo(c.scrollLeft, c.scrollTop)
    }
  }

  setReadyCells(cells: Area): void {
    // console.log(`\nready: ${cells.y}..${cells.till.y}`)
    this.readyCells = cells
    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()
  }

  // Actions & Triggers

  @action
  protected scrollTo(left: number, top: number): void {
    // console.log(`\nscroll: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const s2a = this.surfaceToAllFactor
    const scrollPixelStep = this.viewportToSurfaceFactor
    const jumping = this.jumping
    let vp = this.viewport
    let surface = this.surface
    let thumb = this.thumb.moveTo(xy(left, top), surface.atZero())

    const x = VirtualScroll.calcScrollPos(vp.x, vp.size.x,
      surface.x, surface.size.x, thumb.x, jumping.x,
      scrollPixelStep.x, s2a.x)
    const y = VirtualScroll.calcScrollPos(vp.y, vp.size.y,
      surface.y, surface.size.y, thumb.y, jumping.y,
      scrollPixelStep.y, s2a.y)

    vp = vp.moveTo(xy(x.viewport, y.viewport), this.all)
    surface = surface.moveTo(xy(x.surface, y.surface), this.all)
    thumb = thumb.moveTo(xy(x.thumb, y.thumb), surface.atZero())
    if (!vp.equalTo(this.viewport))
      this.viewport = vp
    if (!surface.equalTo(this.surface))
      this.surface = surface
    if (!thumb.equalTo(this.thumb))
      this.thumb = thumb
    this.jumping = xy(x.jumping, y.jumping)
  }

  private static calcScrollPos(existingViewport: number, viewportSize: number,
    surface: number, surfaceSize: number, thumb: number, jumping: number,
    scrollbarPixelSize: number, surfaceToAllRatio: number): ScrollPos {
    const now = Date.now()
    const p: ScrollPos = { viewport: surface + thumb, surface, thumb, jumping: 0 }
    const diff = Math.abs(p.viewport - existingViewport)
    const jump = diff > 3 * viewportSize || now - jumping < 20 // ms
    if (jump) {
      const fraction = 2 * (surfaceSize/2 - thumb) / surfaceSize
      p.viewport = (thumb - 4/5 * scrollbarPixelSize * fraction) * surfaceToAllRatio
      if (p.viewport < 0 || p.viewport + viewportSize >= surfaceSize * surfaceToAllRatio)
        p.viewport = thumb * surfaceToAllRatio
      p.surface = p.viewport - thumb
      p.jumping = now
      console.log(`jump: thumb=${p.thumb}, viewport=${p.viewport}, surface=${p.surface}`)
    }
    else {
      const precise = p.viewport / surfaceToAllRatio
      const fraction = 2 * (surfaceSize/2 - precise) / surfaceSize
      const optimal = Math.ceil(precise + 4/5 * scrollbarPixelSize * fraction)
      const rebase = p.viewport - optimal
      if (Math.abs(optimal - thumb) > 1/3 * scrollbarPixelSize &&
        rebase >= 0 && rebase + surfaceSize < surfaceSize * surfaceToAllRatio) {
        p.thumb = optimal
        p.surface = rebase
        console.log(`rebase: thumb=${thumb}->${p.thumb}, viewport=${p.viewport}, surface=${p.surface}, jump=${jumping}`)
      }
      else if (existingViewport !== p.viewport)
        console.log(`scroll: thumb=${p.thumb}, viewport=${p.viewport}, surface=${p.surface}`)
    }
    // if (vp !== result) console.log(`${jump ? 'jump' : 'shift'}: thumb=${thumb}, viewport=${vp}->${result}`)
    return p
  }

  @trigger
  protected syncThumbWithDevice(): void {
    const c = this.component
    if (c) {
      const thumb = this.thumb
      if (Math.abs(thumb.x - c.scrollLeft) > 0.1)
        c.scrollLeft = thumb.x
      if (Math.abs(thumb.y - c.scrollTop) > 0.1)
        c.scrollTop = thumb.y
    }
  }
}