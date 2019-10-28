// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action } from 'reactronic'
import { AppWindow } from './view/AppWindow'
import { VirtualScroll } from '../source/VirtualScroll'

const scroll = Action.run('app', () => new VirtualScroll(100, 1000000000))
const root = document.getElementById('root')
ReactDOM.render(<AppWindow key="app" scroll={scroll}/>, root)
