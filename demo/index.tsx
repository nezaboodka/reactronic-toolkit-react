// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action } from 'reactronic'
import { AppWindow } from './widget/AppWindow'
import { area } from '../source/Area'
import { VirtualScroll } from '../source/VirtualScroll'

const app = Action.run('app', () => { const t = new VirtualScroll(); t.grid = area(0, 0, 100, 100000); return t })
const root = document.getElementById('root')
ReactDOM.render(<AppWindow key="app" app={app}/>, root)
