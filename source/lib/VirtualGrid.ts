// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache, Monitor, passive, State, trigger } from 'reactronic'

import { Area, area, num, XY, xy } from './Area'

const SURFACE_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
const TARGET_GRID_SIZE_LIMIT: Area = area(0, 0, 899, 899)
const SMOOTH_SCROLL_DEBOUNCE = 25 // ms

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

type Position = { viewport: number, surface: number, thumb: number, jumping: number }

export class VirtualGrid extends State {
  allCells: Area
  component: IComponent | null | undefined = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  surface: Area = Area.ZERO
  thumb: Area = Area.ZERO
  viewport: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  debounce = Monitor.create('debounce', SMOOTH_SCROLL_DEBOUNCE)
  interaction: number = 0
  jumping: XY = xy(0, 0)

  constructor(sizeX: number, sizeY: number) {
    super()
    this.allCells = area(0, 0, sizeX, sizeY)
    Cache.of(this.scroll).setup({monitor: this.debounce})
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
    // console.log(`\n\n=== Interaction ${this.interaction} ===`)
  }

  @action
  scroll(): void {
    const c = this.component
    if (c) {
      // console.log(`onscroll: ${c.scrollTop}`)
      const t = this.thumb
      const dpr = 0.75/devicePixelRatio
      const left = c.scrollLeft
      const top = c.scrollTop
      if (Math.abs(t.y - top) > dpr || Math.abs(t.x - left) > dpr)
        this.applyThumbPos(left, top, false)
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
      passive(() => this.applyThumbPos(this.thumb.x, this.thumb.y, true))
  }

  @trigger
  protected reflectThumbPos(): void {
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
    const all = this.all
    let vp = this.viewport
    let surface = this.surface
    let thumb = this.thumb.moveTo(xy(left, top), surface.atZero())

    const x = VirtualGrid.getTargetPos(ready, this.interaction, this.jumping.x,
      vp.x, vp.size.x, surface.x, surface.size.x, all.size.x,
      thumb.x, this.thumbToAllFactor.x, this.viewportToSurfaceFactor.x)
    const y = VirtualGrid.getTargetPos(ready, this.interaction, this.jumping.y,
      vp.y, vp.size.y, surface.y, surface.size.y, all.size.y,
      thumb.y, this.thumbToAllFactor.y, this.viewportToSurfaceFactor.y,)

    vp = vp.moveTo(xy(x.viewport, y.viewport), all)
    surface = surface.moveTo(xy(x.surface, y.surface), all)
    thumb = thumb.moveTo(xy(x.thumb, y.thumb), surface.atZero())
    if (!vp.equalTo(this.viewport))
      this.viewport = vp
    if (!surface.equalTo(this.surface))
      this.surface = surface
    if (!thumb.equalTo(this.thumb))
      this.thumb = thumb
    this.jumping = xy(x.jumping, y.jumping)
  }

  private static getTargetPos(ready: boolean, interaction: number, jumping: number,
    viewport: number, viewportSize: number, surface: number, surfaceSize: number,
    allSize: number, thumb: number, thumbToAllRatio: number, scrollbarPixelSize: number): Position {
    const p: Position = { viewport: surface + thumb, surface, thumb, jumping }
    const diff = Math.abs(p.viewport - viewport)
    const jump = diff > 3 * viewportSize || interaction === jumping
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
      const optimal = precise + 4/5 * scrollbarPixelSize * fraction
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
    // const pos = `th(${num(p.thumb, 3)})  +  sf(${num(p.surface, 3)})  =  vp(${num(p.viewport, 3)}..${num(p.viewport + viewportSize, 3)})    // error ${num(p.viewport - p.surface - p.thumb, 3)}`
    // if (jump)
    //   console.log(`jump:   ${pos}`)
    // else if (thumb !== p.thumb)
    //   console.log(`rebase: ${pos}    // was: th(${num(thumb, 3)})  +  sf(${num(surface, 3)})`)
    // else if (viewport !== p.viewport)
    //   console.log(`pan:    ${pos}`)
    // if (ready && (thumb !== p.thumb || viewport !== p.viewport))
    //   console.log('ready')
    return p
  }
}
