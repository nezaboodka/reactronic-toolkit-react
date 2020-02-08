// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { Cache, Monitor, nonreactive, Stateful, transaction, trigger } from 'reactronic'

import { Area, area, XY, xy } from './Area'

export const SURFACE_SIZE_LIMIT: number = 1000123 // pixels
export const SPOT_GRID_SIZE_LIMIT: Area = area(0, 0, 899, 899)
export const SMOOTH_SCROLL_DEBOUNCE = 40 // ms

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

export class VirtualGrid extends Stateful {
  bufferingRatio: XY = xy(1.0, 1.7)
  allCells: Area
  component: IComponent = undefined
  ppcX: number = 1 // pixels per cell
  ppcY: number = 1
  thumbX: number = 0
  thumbY: number = 0
  surfaceX: number = 0
  surfaceY: number = 0
  surfaceSizeX: number = 0
  surfaceSizeY: number = 0
  viewportX: number = 0
  viewportY: number = 0
  viewportSizeX: number = 0
  viewportSizeY: number = 0
  loadedCells: Area = Area.ZERO
  readyCells: Area = Area.ZERO
  spot: Area = Area.ZERO
  spotId: number = 0
  sizing = new Sizing()
  interaction: number = 1
  jumpingX: number = 0
  jumpingY: number = 0
  scrolling = Monitor.create('scrolling', SMOOTH_SCROLL_DEBOUNCE)

  constructor(columns: number, rows: number) {
    super()
    this.allCells = area(0, 0, columns, rows)
    Cache.of(this.scroll).setup({monitor: this.scrolling})
  }

  // Areas

  get allArea(): Area {
    return this.allCells.scaleBy(this.ppc)
  }

  get bufferArea(): Area {
    return this.bufferCells.scaleBy(this.ppc)
  }

  get loadedArea(): Area {
    return this.loadedCells.scaleBy(this.ppc)
  }

  get surfaceArea(): Area {
    return area(this.surfaceX, this.surfaceY, this.surfaceSizeX, this.surfaceSizeY)
  }

  get surfaceCells(): Area {
    return this.surfaceArea.scaleBy(this.pixelToCellRatio)
  }

  get bufferCells(): Area {
    const vpc = this.viewportCells
    const buf = vpc.zoomAt(vpc.center, this.bufferingRatio)
    return buf.roundToOuter().truncateBy(this.allCells)
  }

  get viewportArea(): Area {
    return area(this.viewportX, this.viewportY, this.viewportSizeX, this.viewportSizeY)
  }

  get viewportCells(): Area {
    return this.viewportArea.scaleBy(this.pixelToCellRatio)
  }

  // Actions

  @transaction
  mount(width: number, height: number, resolution: number, component: IComponent): void {
    this.ppcX = resolution * 4
    this.ppcY = resolution
    this.thumbX = 0
    this.thumbY = 0
    this.surfaceX = 0
    this.surfaceY = 0
    this.surfaceSizeX = Math.min(this.allArea.size.x, SURFACE_SIZE_LIMIT)
    this.surfaceSizeY = Math.min(this.allArea.size.y, SURFACE_SIZE_LIMIT)
    this.viewportX = 0
    this.viewportY = 0
    this.viewportSizeX = width
    this.viewportSizeY = height
    this.loadedCells = Area.ZERO
    this.readyCells = Area.ZERO
    this.spot = this.allCells.truncateBy(SPOT_GRID_SIZE_LIMIT)
    this.spotId = 0
    this.sizing  = new Sizing()
    this.interaction = 1
    this.jumpingX = 0
    this.jumpingY = 0
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

  @transaction
  impulse(key?: string): void {
    const i = ++this.interaction
    if (key === 'Home' || key === 'End')
      this.jumpingX = this.jumpingY = -i
    // console.log(`\n\n=== Interaction ${this.interaction} ===`)
  }

  // prevScroll: number = performance.now()

  @transaction
  scroll(x: number, y: number): void {
    const c = this.component
    if (c) {
      // const now = performance.now()
      // console.log(`onscroll: ${c.scrollTop} (prev was ${now - this.prevScroll} ms ago)`)
      // this.prevScroll = now
      const dpr = 0.75/devicePixelRatio
      if (Math.abs(this.thumbY - y) > dpr || Math.abs(this.thumbX - x) > dpr)
        this.applyThumbPos(x, y, false)
    }
  }

  @transaction
  loaded(cells: Area): void {
    // console.log(`\nready: ${cells.y}..${cells.till.y}`)
    this.loadedCells = cells
    const spot = this.spot
    if (!spot.envelops(cells)) {
      this.spot = spot.moveCenterTo(cells.center, this.allCells).round()
      this.spotId++
    }
  }

  // Triggers

  @trigger
  protected rebaseSurface(): void {
    if (this.component && !this.scrolling.isActive)
      nonreactive(() => this.applyThumbPos(this.thumbX, this.thumbY, true))
  }

  @trigger
  protected reflectThumb(): void {
    const e = this.component
    if (e) {
      const x = this.thumbX
      const y = this.thumbY
      if (Math.abs(x - e.scrollLeft) > 0.1)
        e.scrollLeft = x
      if (Math.abs(y - e.scrollTop) > 0.1)
        e.scrollTop = y
    }
  }

  @trigger
  protected applyReadyCells(): void {
    const ready = this.readyCells
    const loaded = this.loadedCells
    if (!ready.equalTo(loaded) && loaded.overlaps(this.viewportCells)) {
      if (!ready.overlaps(loaded))
        this.spotId++
      this.readyCells = loaded
    }
  }

  // Ratios

  get ppc(): XY {
    return xy(this.ppcX, this.ppcY)
  }

  protected get pixelToCellRatio(): XY {
    const ppc = this.ppc
    return xy(1/ppc.x, 1/ppc.y)
  }

  get viewportToSurfaceRatio(): XY {
    return xy(
      this.surfaceSizeX / this.viewportSizeX,
      this.surfaceSizeY / this.viewportSizeY)
  }

  get surfaceToViewportRatio(): XY {
    const vp2sf = this.viewportToSurfaceRatio
    return xy(1/vp2sf.x, 1/vp2sf.y)
  }

  protected get surfaceToAllRatio(): XY {
    const all = this.allArea
    return xy(
      all.size.x / this.surfaceSizeX,
      all.size.y / this.surfaceSizeY)
  }

  get allToSurfaceRatio(): XY {
    const sf2all = this.surfaceToAllRatio
    return xy(1/sf2all.x, 1/sf2all.y)
  }

  protected get thumbToAllRatio(): XY {
    const all = this.allArea
    return xy(
      all.size.x / (this.surfaceSizeX - this.viewportSizeX),
      all.size.y / (this.surfaceSizeY - this.viewportSizeY))
  }

  protected get allToThumbRatio(): XY {
    const all2th = this.allToThumbRatio
    return xy(1/all2th.x, 1/all2th.y)
  }

  get viewportToAllRatio(): XY {
    const all = this.allArea
    return xy(
      all.size.x / this.viewportSizeX,
      all.size.y / this.viewportSizeY)
  }

  protected get allToViewportRatio(): XY {
    const vp2all = this.viewportToAllRatio
    return xy(1/vp2all.x, 1/vp2all.y)
  }

  // Internal

  private applyThumbPos(left: number, top: number, ready: boolean): void {
    // console.log(`\napply: ${this.thumb.y}->${top}, h=${this.component ? this.component.scrollHeight : '?'}`)
    const all = this.allArea

    const x = VirtualGrid.getNewPos(ready, this.interaction, this.jumpingX,
      this.viewportX, this.viewportSizeX, this.surfaceX, this.surfaceSizeX, all.size.x, left,
      this.thumbToAllRatio.x, this.viewportToSurfaceRatio.x)
    const y = VirtualGrid.getNewPos(ready, this.interaction, this.jumpingY,
      this.viewportY, this.viewportSizeY, this.surfaceY, this.surfaceSizeY, all.size.y, top,
      this.thumbToAllRatio.y, this.viewportToSurfaceRatio.y,)

    this.viewportX = x.viewport
    this.viewportY = y.viewport
    this.surfaceX = x.surface
    this.surfaceY = y.surface
    this.thumbX = x.thumb
    this.thumbY = y.thumb
    this.jumpingX = x.jumping
    this.jumpingY = y.jumping
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

    // const pos = `th(${num(p.thumb, 2)})  +  sf(${num(p.surface, 2)})  =  vp(${num(p.viewport, 2)} :: ${num(p.viewport + viewportSize, 2)})    // error ${num(p.viewport - p.surface - p.thumb, 2)}`
    // if (jump)
    //   console.log(`jump:   ${pos}`)
    // else if (thumb !== p.thumb)
    //   console.log(`rebase: ${pos}    // was: th(${num(thumb, 2)})  +  sf(${num(surface, 2)})`)
    // else if (viewport !== p.viewport)
    //   console.log(`pan:    ${pos}`)
    // if (ready && (thumb !== p.thumb || viewport !== p.viewport))
    //   console.log('ready')

    return p
  }
}
