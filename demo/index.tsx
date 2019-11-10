// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action, Tools as RT, TraceLevel } from 'reactronic'
import { Database } from './models/Database'
import { Viewport } from '../source/index'
import { AppWindow } from './views/AppWindow'

RT.setTrace(TraceLevel.Off)
RT.performanceWarningThreshold = 0 // disable

const vs = Action.run('vs', () => new Viewport(10000, 1000000000000))
const db = Action.run('db', () => new Database())
const root = document.getElementById('root')
ReactDOM.render(<AppWindow key="app" db={db} vs={vs}/>, root)
