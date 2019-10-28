// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action, Tools as RT, TraceLevel } from 'reactronic'
import { Database } from './model/Database'
import { VirtualScroll } from '../source/index'
import { AppWindow } from './view/AppWindow'

RT.setTrace(TraceLevel.Basic)
RT.performanceWarningThreshold = 0 // disable

const scroll = Action.run('scroll', () => new VirtualScroll(100, 1000000000))
const db = Action.run('data', () => new Database())
const root = document.getElementById('root')
ReactDOM.render(<AppWindow key="app" scroll={scroll} db={db}/>, root)
