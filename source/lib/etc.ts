// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

export function moveBy(pos: number, size: number,
  delta: number, minPos: number, maxSize: number): number {
  const below = pos + delta - minPos
  const above = minPos + maxSize - (pos + delta + size)
  pos = below < 0 ? minPos : pos += delta
  if (above < 0)
    pos += above
  return pos
}
