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

const vs = Action.run('vs', () => new VirtualScroll(10000, 1000000000))
const db = Action.run('db', () => new Database())
const root = document.getElementById('root')
ReactDOM.render(<AppWindow key="app" db={db} vs={vs}/>, root)
