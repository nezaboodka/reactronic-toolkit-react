// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache, Monitor, nonreactive, State, trigger } from 'reactronic'

import { Area, area, num, XY, xy } from './Area'

export const SURFACE_SIZE_LIMIT: Area = area(0, 0, 1000123, 1000123)
export const TARGET_GRID_SIZE_LIMIT: Area = area(0, 0, 899, 899)
export const SMOOTH_SCROLL_DEBOUNCE = 35 // ms

export type IComponent = undefined | null | EventTarget & {
  scrollLeft: number
  scrollTop: number
}

export interface Pos {
  viewport: number
  surface: number
  thumb: number
  jumping: number
}

export interface Guide {
  index: number
  till: number
}

export class Sizing {
  customCellWidth: Guide[] = []
  customCellHeight: Guide[] = []
}

export class VirtualGrid extends State {
  allCells: Area
  component: IComponent = undefined
  ppc: XY = xy(1, 1) // pixels per cell
  thumb: Area = Area.ZERO
  surfaceArea: Area = Area.ZERO
  viewportArea: Area = Area.ZERO
  bufferSize: XY = xy(1.0, 1.0)
  readyCells: Area = Area.ZERO
  targetGrid: Area = Area.ZERO
  sizing = new Sizing()
  interaction: number = 0
  jumping: XY = xy(0, 0)
  debounce = Monitor.create('debounce', SMOOTH_SCROLL_DEBOUNCE)

  constructor(columns: number, rows: number) {
    super()
    this.allCells = area(0, 0, columns, rows)
    Cache.of(this.scroll).setup({monitor: this.debounce})
  }

  // Areas

  get allArea(): Area {
    return this.allCells.scaleBy(this.ppc)
  }

  get bufferArea(): Area {
    return this.bufferCells.scaleBy(this.ppc)
  }

  get readyArea(): Area {
    return this.readyCells.scaleBy(this.ppc)
  }

  get surfaceCells(): Area {
    return this.surfaceArea.scaleBy(this.pixelToCellRatio)
  }

  get bufferCells(): Area {
    const vpc = this.viewportCells
    const buf = vpc.zoomAt(vpc.center, this.bufferSize)
    return buf.roundToOuter().truncateBy(this.allCells)
  }

  get viewportCells(): Area {
    return this.viewportArea.scaleBy(this.pixelToCellRatio)
  }

  // Actions

  @action
  mount(x: number, y: number, resolution: number, component: IComponent): void {
    this.ppc = xy(resolution * 8, resolution)
    this.thumb = new Area(0, 0, x, y)
    this.surfaceArea = this.allArea.truncateBy(SURFACE_SIZE_LIMIT)
    this.viewportArea = new Area(0, 0, x, y)
    this.targetGrid = this.allCells.truncateBy(TARGET_GRID_SIZE_LIMIT)
    if (component !== this.component) {
      if (this.component) {
        // this.component.removeEventListener('scroll', ...)
        // this.component.removeEventListener('wheel', ...)
        // this.component.removeEventListener('pointerdown', ...)
        // this.component.removeEventListener('scroll', ...)
      }
      if (component) {
        // component.addEventListener('scroll', e => this.scroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop))
        // component.addEventListener('wheel', e => this.interact())
        // component.addEventListener('pointerdown', e => this.interact())
        // component.addEventListener('keydown', e => this.interact(e.key))
      }
      this.component = component
    }
  }

  @action
  interact(key?: string): void {
    const i = ++this.interaction
    if (key === 'Home' || key === 'End')
      this.jumping = xy(-i, -i)
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
  ready(cells: Area): void {
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

  // Ratios

  protected get pixelToCellRatio(): XY {
    const ppc = this.ppc
    return xy(1/ppc.x, 1/ppc.y)
  }

  get viewportToSurfaceRatio(): XY {
    const sf = this.surfaceArea
    const vp = this.viewportArea
    return xy(
      sf.size.x / vp.size.x,
      sf.size.y / vp.size.y)
  }

  get surfaceToViewportRatio(): XY {
    const vp2sf = this.viewportToSurfaceRatio
    return xy(1/vp2sf.x, 1/vp2sf.y)
  }

  protected get surfaceToAllRatio(): XY {
    const all = this.allArea
    const sf = this.surfaceArea
    return xy(
      all.size.x / sf.size.x,
      all.size.y / sf.size.y)
  }

  get allToSurfaceRatio(): XY {
    const sf2all = this.surfaceToAllRatio
    return xy(1/sf2all.x, 1/sf2all.y)
  }

  protected get thumbToAllRatio(): XY {
    const all = this.allArea
    const sf = this.surfaceArea
    const vp = this.viewportArea
    return xy(
      all.size.x / (sf.size.x - vp.size.x),
      all.size.y / (sf.size.y - vp.size.y))
  }

  protected get allToThumbRatio(): XY {
    const all2th = this.allToThumbRatio
    return xy(1/all2th.x, 1/all2th.y)
  }

  get viewportToAllRatio(): XY {
    const all = this.allArea
    const vp = this.viewportArea
    return xy(
      all.size.x / vp.size.x,
      all.size.y / vp.size.y)
  }

  protected get allToViewportRatio(): XY {
    const vp2all = this.viewportToAllRatio
    return xy(1/vp2all.x, 1/vp2all.y)
  }

  // Internal

  private applyThumbPos(left: number, top: number, ready: boolean): void {
    // console.log(`\napply: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const all = this.allArea
    let vp = this.viewportArea
    let sf = this.surfaceArea
    let th = this.thumb.moveTo(xy(left, top), sf.atZero())

    const x = VirtualGrid.getNewPos(ready, this.interaction, this.jumping.x,
      vp.x, vp.size.x, sf.x, sf.size.x, all.size.x, th.x,
      this.thumbToAllRatio.x, this.viewportToSurfaceRatio.x)
    const y = VirtualGrid.getNewPos(ready, this.interaction, this.jumping.y,
      vp.y, vp.size.y, sf.y, sf.size.y, all.size.y, th.y,
      this.thumbToAllRatio.y, this.viewportToSurfaceRatio.y,)

    vp = vp.moveTo(xy(x.viewport, y.viewport), all)
    sf = sf.moveTo(xy(x.surface, y.surface), all)
    th = th.moveTo(xy(x.thumb, y.thumb), sf.atZero())

    if (!vp.equalTo(this.viewportArea))
      this.viewportArea = vp
    if (!sf.equalTo(this.surfaceArea))
      this.surfaceArea = sf
    if (!th.equalTo(this.thumb))
      this.thumb = th
    this.jumping = xy(x.jumping, y.jumping)
  }

  private static getNewPos(ready: boolean, interaction: number, jumping: number,
    viewport: number, viewportSize: number, surface: number, surfaceSize: number,
    allSize: number, thumb: number, thumbToAllRatio: number, scrollbarPixelSize: number): Pos {

    const p: Pos = { viewport: surface + thumb, surface, thumb, jumping }
    const jump = interaction === jumping ||
      (interaction === -jumping && (thumb === 0 || thumb + viewportSize >= surfaceSize)) ||
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
