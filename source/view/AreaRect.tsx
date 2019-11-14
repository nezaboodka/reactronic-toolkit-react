// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cx } from 'emotion'
import * as React from 'react'
import { TraceLevel } from 'reactronic'

import { Area, num, place, reactive } from '@reactronic-toolkit-react'

import { style } from './TelescopeDebugger.css'

export function AreaRect(p: {
  hint: string,
  area: Area,
  px: Area,
  inner?: Area,
  className?: string,
  style?: React.CSSProperties,
  children?: JSX.Element}): JSX.Element {
  return reactive(counter => {
    const css = style.classes
    return (
      <div className={cx(css.area, p.className)} style={p.style}>
        <div className={css.areaHint} style={place(2, 2, 9, 2)}>
          {p.hint}: {num(p.area.size.y, -3)} rows, {num(p.area.size.x, -3)} columns<br/>
          <i>↕ {num(p.px.size.y, 1)} px, {num(p.px.size.x, 1)} px</i>
        </div>
        <div className={css.areaFrom} style={place(5, 2, 9, 2)}>
          {num(p.area.from.y, 3)}<br/>
          <i>{num(p.px.from.y, 1)} px</i>
        </div>
        <div className={css.areaTill} style={place(5, 9, 9, 9)}>
          <i>{num(p.px.till.y, 1)} px</i><br/>
          {num(p.area.till.y, 3)}
        </div>
        {p.inner && (
          <div className={css.areaOuter} style={place(2, 3, 9, 3)}>
            <i>Gap: {num(p.inner.y - p.px.y, 1)} px</i>
          </div>
        )}
        <div className={css.areaCenter} style={place(5, 5, 6, 6)}>{p.children}</div>
      </div>
    )
  }, TraceLevel.Suppress)
}
