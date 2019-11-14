// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action, Tools as RT, TraceLevel } from 'reactronic'

import { Application } from '~/model/Application'
import { AppWindow } from '~/view/AppWindow'

RT.setTrace(TraceLevel.Off)
RT.performanceWarningThreshold = 0 // disable

const app = Action.run('app', () => new Application())
const root = document.getElementById('root')
ReactDOM.render(<AppWindow app={app}/>, root)
