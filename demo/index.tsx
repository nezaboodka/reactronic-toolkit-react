// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

// import * as React from 'react'
// import * as ReactDOM from 'react-dom'
// import { Action, Reactronic as R, TraceLevel } from 'reactronic'

// import { Application } from '~/app/Application'
// import { AppMain } from '~/view/AppMain'

// R.setTrace(TraceLevel.Warnings)

// const app = Action.run('app', () => new Application())
// const root = document.getElementById('root')
// ReactDOM.render(<AppMain app={app}/>, root)

import { Reactronic as R, TraceLevel, Transaction as Tran } from 'reactronic'

import { Model } from '~/viewtronic/example.model'
import { App } from '~/viewtronic/example.view'

R.setTrace(TraceLevel.Off)

const model = Tran.run('init', () => new Model())
App('demo fake', model)
App('demo', model)

