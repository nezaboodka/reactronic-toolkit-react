// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export class XY {
  readonly x: number
  readonly y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export class Area extends XY {
  static readonly ZERO = Object.freeze(area(0, 0, 0, 0))
  static readonly MAX = Object.freeze(area(Number.MIN_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MAX_VALUE))
  static readonly INFINITY = Object.freeze(area(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY))

  readonly size: XY
  get from(): XY { return this }
  get till(): XY { return xy(this.x + this.size.x - 1, this.y + this.size.y - 1) }
  get center(): XY { return xy(this.x + this.size.x / 2, this.y + this.size.y / 2) }

  constructor(x: number, y: number, w: number, h: number) {
    super(x, y)
    this.size = xy(w, h)
  }

  moveTo(pos: XY, bounds: Area): Area {
    return this.moveBy(xy(pos.x - this.x, pos.y - this.y), bounds)
  }

  moveCenterTo(pos: XY, bounds: Area): Area {
    const c = this.center
    return this.moveBy(xy(pos.x - c.x, pos.y - c.y), bounds)
  }

  moveBy(delta: XY, bounds: Area): Area {
    // return this.moveTo(xy(this.x + delta.x, this.y + delta.y), bounds)

    const dx = this.x + delta.x - bounds.x
    const dy = this.y + delta.y - bounds.y
    const ox = bounds.x + bounds.size.x - (this.x + delta.x + this.size.x)
    const oy = bounds.y + bounds.size.y - (this.y + delta.y + this.size.y)

    let x = this.x + delta.x
    let y = this.y + delta.y

    if (dx < 0)
      x = bounds.x
    if (dy < 0)
      y = bounds.y
    if (ox < 0)
      x += ox
    if (oy < 0)
      y += oy

    return area(x, y, this.size.x, this.size.y)
  }

  resize(size: XY): Area {
    return area(this.x, this.y, size.x, size.y)
  }

  zoomAt(origin: XY, factor: XY): Area {
    return area(
      origin.x + (this.x - origin.x) * factor.x,
      origin.y + (this.y - origin.y) * factor.y,
      this.size.x * factor.x,
      this.size.y * factor.y)
  }

  scaleBy(factor: XY): Area {
    return this.zoomAt(Area.ZERO, factor)
  }

  round(): Area {
    return area(
      Math.round(this.x), Math.round(this.y),
      Math.round(this.size.x), Math.round(this.size.y))
  }

  roundToOuter(): Area {
    return area(
      Math.floor(this.x), Math.floor(this.y),
      Math.ceil(this.size.x), Math.ceil(this.size.y))
  }

  roundToInner(): Area {
    return area(
      Math.ceil(this.x), Math.ceil(this.y),
      Math.floor(this.size.x), Math.floor(this.size.y))
  }

  truncateBy(bounds: Area): Area {
    const dx = this.x - bounds.x
    const dy = this.y - bounds.y
    const ox = bounds.x + bounds.size.x - (this.x + this.size.x)
    const oy = bounds.y + bounds.size.y - (this.y + this.size.y)

    let x = this.x
    let y = this.y
    let sx = this.size.x
    let sy = this.size.y

    if (dx < 0) {
      x = bounds.x
      sx += dx
    }
    if (dy < 0) {
      y = bounds.y
      sy += dy
    }
    if (ox < 0)
      sx += ox
    if (oy < 0)
      sy += oy

    return area(x, y, sx, sy)
  }

  equalTo(a: Area): boolean {
    return this.x === a.x && this.y === a.y &&
      this.size.x === a.size.x && this.size.y === a.size.y
  }

  overlaps(a: Area): boolean {
    return (
      a.y >= this.y && a.y < this.y + this.size.y &&
      a.x >= this.x && a.x < this.x + this.size.x) ||
      (
        a.y + a.size.y > this.y && a.y + a.size.y < this.y + this.size.y &&
        a.x + a.size.x > this.x && a.x + a.size.x < this.x + this.size.x)
  }

  envelops(a: Area): boolean {
    return (
      a.y >= this.y && a.y < this.y + this.size.y &&
      a.x >= this.x && a.x < this.x + this.size.x) &&
      (
        a.y + a.size.y > this.y && a.y + a.size.y <= this.y + this.size.y &&
        a.x + a.size.x > this.x && a.x + a.size.x <= this.x + this.size.x)
  }

  toString(): string {
    return `${num(this.x, -15)}, ${num(this.y, -15)} (w: ${num(this.size.x, -15)}, h: ${num(this.size.y, -15)})`
  }
}

export function xy(x: number, y: number): XY {
  return new XY(x, y)
}

export function area(x: number, y: number, w: number, h: number): Area {
  return new Area(x, y, w, h)
}

export function num(n: number, fr?: number): string {
  const s = fr !== undefined && fr < 0 ? n.toFixed(n % 1 !== 0 ? -fr : 0) : n.toFixed(fr)
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
