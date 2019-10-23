// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { State, Action, Cache, stateless, trigger, cached, separate, Tools as RT, Trace } from 'reactronic'

export function reactive(render: (counter: number) => JSX.Element, trace?: Partial<Trace>): JSX.Element {
  const [state, refresh] = React.useState<ReactState>(
    !trace ? createReactState : () => createReactState(trace))
  const rx = state.rx
  rx.counter = state.counter
  rx.refresh = refresh // just in case React will change refresh on each rendering
  React.useEffect(rx.unmountEffect, [])
  return rx.jsx(render)
}

// Internal

type ReactState = { rx: Rx, counter: number }

class Rx extends State {
  @cached
  jsx(render: (counter: number) => JSX.Element): JSX.Element {
    return render(this.counter)
  }

  @trigger
  keepFresh(): void {
    if (Cache.of(this.jsx).invalid)
      separate(this.refresh, {rx: this, counter: this.counter + 1})
  }

  @stateless counter: number = 0
  @stateless refresh: (next: ReactState) => void = nop
  @stateless readonly unmountEffect = (): (() => void) => {
    return (): void => { separate(Cache.unmount, this) }
  }
}

function createReactState(trace?: Partial<Trace>): ReactState {
  const hint = RT.isTraceOn ? getComponentName() : '<rx>'
  const rx = Action.runAs<Rx>(hint, false, trace, undefined, createRx, hint, trace)
  return {rx, counter: 0}
}

function createRx(hint: string | undefined, trace: Trace | undefined): Rx {
  const rx = new Rx()
  if (hint)
    RT.setTraceHint(rx, hint)
  if (trace) {
    Cache.of(rx.jsx).setup({trace})
    Cache.of(rx.keepFresh).setup({trace})
  }
  return rx
}

function nop(...args: any[]): void {
  // do nothing
}

function getComponentName(): string {
  const restore = Error.stackTraceLimit = 20
  const error = new Error()
  const stack = error.stack || ''
  Error.stackTraceLimit = restore
  const lines = stack.split('\n')
  const i = lines.findIndex(x => x.indexOf('.reactiveRender') >= 0) || 6
  let result: string = lines[i + 1] || ''
  result = (result.match(/^\s*at\s*(\S+)/) || [])[1]
  return result !== undefined ? `<${result}>` : '<Rx>'
}
