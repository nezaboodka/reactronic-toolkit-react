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

  atZero(): Area {
    return this.moveTo(Area.ZERO, Area.INFINITY)
  }

  moveCenterTo(pos: XY, bounds: Area): Area {
    const c = this.center
    return this.moveBy(xy(pos.x - c.x, pos.y - c.y), bounds)
  }

  moveBy(delta: XY, bounds: Area): Area {
    // return this.moveTo(xy(this.x + delta.x, this.y + delta.y), bounds)
    const x = moveBy(this.x, this.size.x, delta.x, bounds.x, bounds.size.x)
    const y = moveBy(this.y, this.size.y, delta.y, bounds.y, bounds.size.y)
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
      Math.floor(this.x),
      Math.floor(this.y),
      Math.ceil(this.size.x + this.x - Math.floor(this.x)),
      Math.ceil(this.size.y + this.y - Math.floor(this.y)))
  }

  roundToInner(): Area {
    return area(
      Math.ceil(this.x),
      Math.ceil(this.y),
      Math.floor(this.size.x + this.x - Math.ceil(this.x)),
      Math.floor(this.size.y + this.y - Math.ceil(this.y)))
  }

  truncateBy(bounds: Area): Area {
    const dx = this.x - bounds.x
    const ox = bounds.x + bounds.size.x - (this.x + this.size.x)
    let x = this.x
    let sx = this.size.x
    if (dx < 0) {
      x = bounds.x
      sx += dx
    }
    if (ox < 0)
      sx += ox

    const dy = this.y - bounds.y
    const oy = bounds.y + bounds.size.y - (this.y + this.size.y)
    let y = this.y
    let sy = this.size.y
    if (dy < 0) {
      y = bounds.y
      sy += dy
    }
    if (oy < 0)
      sy += oy

    return area(x, y, sx, sy)
  }

  equalTo(a: Area): boolean {
    return this !== a && this.x === a.x && this.y === a.y &&
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

export function moveBy(pos: number, size: number,
  delta: number, minPos: number, maxSize: number): number {
  const below = pos + delta - minPos
  const above = minPos + maxSize - (pos + delta + size)
  pos = below < 0 ? minPos : pos += delta
  if (above < 0)
    pos += above
  return pos
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

// export function dumpArea(a: Area, fr?: number): string {
//   return `x: ${num(a.x, fr)}, y: ${num(a.y, fr)}, w: ${num(a.x + a.size.x, fr)}, h: ${num(a.y + a.size.y, fr)}`
// }
