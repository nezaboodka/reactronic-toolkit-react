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
  readonly size: XY
  get from(): XY { return this }
  get till(): XY { return xy(this.x + this.size.x - 1, this.y + this.size.y - 1) }

  constructor(x: number, y: number, w: number, h: number) {
    super(x, y)
    this.size = xy(w, h)
  }

  moveBy(delta: XY): Area {
    return area(this.x + delta.x, this.y + delta.y, this.size.x, this.size.y)
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

  round(): Area {
    return area(
      Math.floor(this.x), Math.floor(this.y),
      Math.ceil(this.size.x), Math.ceil(this.size.y))
  }

  getCenter(): XY {
    return area(this.x + this.size.x / 2, this.y + this.size.y / 2, 0, 0)
  }

  equalTo(a: Area): boolean {
    return this.x === a.x && this.y === a.y &&
      this.size.x === a.size.x && this.size.y === a.size.y
  }

  contains(p: XY): boolean {
    return p.x >= this.x && p.x < this.x + this.size.x &&
      p.y >= this.y && p.y < this.y + this.size.y
  }

  isIntersectedWith(a: Area): boolean {
    return this.contains(a) || this.contains(a.till)
  }
}

export const ZERO = Object.freeze(new Area(0, 0, 0, 0))

export function xy(x: number, y: number): XY {
  return new XY(x, y)
}

export function area(x: number, y: number, w: number, h: number): Area {
  return new Area(x, y, w, h)
}
