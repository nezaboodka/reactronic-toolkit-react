// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { action, Cache, Monitor, nonreactive, State, trigger } from 'reactronic'

import { Area, area } from './Area'

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
