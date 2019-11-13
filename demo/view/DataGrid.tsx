// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { reactive } from '../../source/index'
import { DataBuffer } from '../model/DataBuffer'

export function DataGrid(p: {buffer: DataBuffer}): JSX.Element {
  return reactive(() => {
    const data = p.buffer.data
    return (
      <React.Fragment>
        {data.map(row => (
          <div title={row[0]} key={row[0]}>
            {row.map(text => (
              <span key={text} style={{marginLeft: '1em'}}>{text}</span>
            ))}
          </div>
        ))}
      </React.Fragment>
    )
  })
}
