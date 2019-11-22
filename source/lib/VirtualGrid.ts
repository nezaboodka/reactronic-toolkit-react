// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache, Monitor, nonreactive, State, trigger } from 'reactronic'

import { Area, area, num, XY, xy } from './Area'

const SURFACE_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
const TARGET_GRID_SIZE_LIMIT: Area = area(0, 0, 899, 899)
const SMOOTH_SCROLL_DEBOUNCE = 35 // ms

export type Guide = { index: number, till: number }

export class Sizing {
  customCellWidth: Guide[] = [] // in pixels?
  customCellHeight: Guide[] = [] // in pixels?
}

export type IComponent = undefined | null | EventTarget & {
  scrollLeft: number
  scrollTop: number
}

type Position = { viewport: number, surface: number, thumb: number, jumping: number }

export class VirtualGrid extends State {
  allCells: Area
  component: IComponent = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  interaction: number = 0
  jumping: XY = xy(0, 0)
  debounce = Monitor.create('debounce', SMOOTH_SCROLL_DEBOUNCE)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
    Cache.of(this.scroll).setup({monitor: this.debounce})
  }

  @action
  reset(x: number, y: number, resolution: number, component: IComponent): void {
    this.component = component
    this.ppc = xy(resolution * 8, resolution)
    this.surface = this.all.truncateBy(SURFACE_SIZE_LIMIT)
    this.thumb = new Area(0, 0, x, y)
    this.viewport = new Area(0, 0, x, y)
    this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
  }

  // @action
  // setComponent(component: IComponent | null, fontSize: number): void {
  //   const existing = this.events
  //   if (component !== existing) {
  //     if (component) {
  //       this.reset(component.clientWidth, component.clientHeight, fontSize, component)
  //       this.events = component
  //     }
  //     else {
  //       this.events = undefined
  //       this.reset(0, 0, 1, undefined)
  //     }
  //   }
  // }

  // Factors

  get pixelToCellFactor(): XY {
    const r = this.ppc
    return xy(1/r.x, 1/r.y)
  }

  get viewportToSurfaceFactor(): XY {
    const surface = this.surface
    const vp = this.viewport
    return xy(
      surface.size.x / vp.size.x,
      surface.size.y / vp.size.y)
  }

  get surfaceToViewportFactor(): XY {
    const vp2s = this.viewportToSurfaceFactor
    return xy(1/vp2s.x, 1/vp2s.y)
  }

  get surfaceToAllFactor(): XY {
    const all = this.all
    const surface = this.surface
    return xy(
      all.size.x / surface.size.x,
      all.size.y / surface.size.y)
  }

  get allToSurfaceFactor(): XY {
    const s2a = this.surfaceToAllFactor
    return xy(1/s2a.x, 1/s2a.y)
  }

  get thumbToAllFactor(): XY {
    const all = this.all
    const surface = this.surface
    const vp = this.viewport
    return xy(
      all.size.x / (surface.size.x - vp.size.x),
      all.size.y / (surface.size.y - vp.size.y))
  }

  get allToThumbFactor(): XY {
    const a2t = this.allToThumbFactor
    return xy(1/a2t.x, 1/a2t.y)
  }

  get viewportToAllFactor(): XY {
    const all = this.all
    const vp = this.viewport
    return xy(
      all.size.x / vp.size.x,
      all.size.y / vp.size.y)
  }

  get allToViewportFactor(): XY {
    const vp2a = this.viewportToAllFactor
    return xy(1/vp2a.x, 1/vp2a.y)
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

  // Actions

  @action
  interact(): void {
    this.interaction++
    console.log(`\n\n=== Interaction ${this.interaction} ===`)
  }

  @action
  scroll(x: number, y: number): void {
    const c = this.component
    if (c) {
      // console.log(`onscroll: ${c.scrollTop}`)
      const t = this.thumb
      const dpr = 0.75/devicePixelRatio
      if (Math.abs(t.y - y) > dpr || Math.abs(t.x - x) > dpr)
        this.applyThumbPos(x, y, false)
    }
  }

  @action
  setReadyCells(cells: Area): void {
    // console.log(`\nready: ${cells.y}..${cells.till.y}`)
    this.readyCells = cells
    const tg = this.targetGrid
    if (!tg.envelops(cells))
      this.targetGrid = tg.moveCenterTo(cells.center, this.allCells).round()
  }

  // Triggers

  @trigger
  protected rebaseSurface(): void {
    if (this.component && !this.debounce.busy)
      nonreactive(() => this.applyThumbPos(this.thumb.x, this.thumb.y, true))
  }

  @trigger
  protected reflectThumb(): void {
    const e = this.component
    if (e) {
      const thumb = this.thumb
      if (Math.abs(thumb.x - e.scrollLeft) > 0.1)
        e.scrollLeft = thumb.x
      if (Math.abs(thumb.y - e.scrollTop) > 0.1)
        e.scrollTop = thumb.y
    }
  }

  // Internal

  protected applyThumbPos(left: number, top: number, ready: boolean): void {
    // console.log(`\napply: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const all = this.all
    let vp = this.viewport
    let sf = this.surface
    let th = this.thumb.moveTo(xy(left, top), sf.atZero())

    const x = VirtualGrid.getNewPos(ready, this.interaction, this.jumping.x,
      vp.x, vp.size.x, sf.x, sf.size.x, all.size.x, th.x,
      this.thumbToAllFactor.x, this.viewportToSurfaceFactor.x)
    const y = VirtualGrid.getNewPos(ready, this.interaction, this.jumping.y,
      vp.y, vp.size.y, sf.y, sf.size.y, all.size.y, th.y,
      this.thumbToAllFactor.y, this.viewportToSurfaceFactor.y,)

    vp = vp.moveTo(xy(x.viewport, y.viewport), all)
    sf = sf.moveTo(xy(x.surface, y.surface), all)
    th = th.moveTo(xy(x.thumb, y.thumb), sf.atZero())

    if (!vp.equalTo(this.viewport))
      this.viewport = vp
    if (!sf.equalTo(this.surface))
      this.surface = sf
    if (!th.equalTo(this.thumb))
      this.thumb = th
    this.jumping = xy(x.jumping, y.jumping)
  }

  private static getNewPos(ready: boolean, interaction: number, jumping: number,
    viewport: number, viewportSize: number, surface: number, surfaceSize: number,
    allSize: number, thumb: number, thumbToAllRatio: number, scrollbarPixelSize: number): Position {

    const p: Position = { viewport: surface + thumb, surface, thumb, jumping }
    const jump = interaction === jumping ||
      Math.abs(p.viewport - viewport) > 3 * viewportSize
    if (jump) {
      const fraction = 2 * (surfaceSize/2 - thumb) / surfaceSize
      p.viewport = (thumb - 4/5 * scrollbarPixelSize * fraction) * thumbToAllRatio
      if (p.viewport < 0)
        p.viewport = thumb * thumbToAllRatio
      else if (p.viewport > allSize - viewportSize)
        p.viewport = allSize - viewportSize
      p.surface = p.viewport - thumb
      p.jumping = interaction
    }
    else {
      const precise = p.viewport / thumbToAllRatio
      const fraction = 2 * (surfaceSize/2 - precise) / surfaceSize
      const optimal = Math.ceil(precise + 4/5 * scrollbarPixelSize * fraction)
      const s2 = p.viewport - optimal
      if (thumb <= 0 || thumb + viewportSize >= surfaceSize ||
        (ready && Math.abs(optimal - thumb) > 1/3 * scrollbarPixelSize)) {
        if (s2 < 0) {
          p.surface = 0
        }
        else if (s2 + surfaceSize > allSize) {
          p.surface = allSize - surfaceSize
        }
        else {
          p.thumb = optimal
          p.surface = s2
        }
      }
    }

    const pos = `th(${num(p.thumb, 2)})  +  sf(${num(p.surface, 2)})  =  vp(${num(p.viewport, 2)} :: ${num(p.viewport + viewportSize, 2)})    // error ${num(p.viewport - p.surface - p.thumb, 2)}`
    if (jump)
      console.log(`jump:   ${pos}`)
    else if (thumb !== p.thumb)
      console.log(`rebase: ${pos}    // was: th(${num(thumb, 2)})  +  sf(${num(surface, 2)})`)
    else if (viewport !== p.viewport)
      console.log(`pan:    ${pos}`)
    if (ready && (thumb !== p.thumb || viewport !== p.viewport))
      console.log('ready')

    return p
  }
}
