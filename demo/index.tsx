// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Action, Reactronic as R, TraceLevel } from 'reactronic'

import { Application } from '~/app/Application'
import { AppMain } from '~/view/AppMain'
import { z } from '~/view/Z'

z()

R.setTrace(TraceLevel.Warnings)
R.repetitiveReadWarningThreshold = 0 // disabled
R.performanceWarningThreshold = 0

const app = Action.run('app', () => new Application())
const root = document.getElementById('root')
ReactDOM.render(<AppMain app={app}/>, root)
