// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { Action, Cache, cached, isolated, Reactronic as R, Stateful, stateless, Trace, trigger } from 'reactronic'

export type ReactiveOptions = {
  hint: string,
  trace: Partial<Trace>,
  priority: number,
  action: Action
}

export function reactive(render: (cycle: number) => JSX.Element, options?: Partial<ReactiveOptions>): JSX.Element {
  const [state, refresh] = React.useState<ReactState<JSX.Element>>(
    !options ? createReactState : () => createReactState(options.hint, options.trace, options.priority))
  const rx = state.rx
  rx.cycle = state.cycle
  rx.refresh = refresh // just in case React will change refresh on each rendering
  React.useEffect(rx.unmount, [])
  return rx.render(render, options ? options.action : undefined)
}

// export function reactiveJs<E>(run: (element: E) => void, trace?: Partial<Trace>, action?: Action): (element: E) => void {
//   const ref = React.useCallback<(element: E) => void>(element => {
//     const rx = createReactState<E>(trace)
//     if (element) {
//       run(element)
//     }
//     else {
//       // unmount
//     }
//   }, [])
//   return ref
// }

// Internal

type ReactState<V> = { rx: Rx<V>, cycle: number }

class Rx<V> extends Stateful {
  @cached
  render(render: (cycle: number) => V, action?: Action): V {
    return action ? action.inspect(() => render(this.cycle)) : render(this.cycle)
  }

  @trigger
  protected pulse(): void {
    if (Cache.of(this.render).invalid)
      isolated(this.refresh, {rx: this, cycle: this.cycle + 1})
  }

  @stateless cycle: number = 0
  @stateless refresh: (next: ReactState<V>) => void = nop
  @stateless readonly unmount = (): (() => void) => {
    return (): void => { isolated(Cache.unmount, this) }
  }

  static create<V>(hint?: string, trace?: Trace, priority?: number): Rx<V> {
    const rx = new Rx<V>()
    if (hint)
      R.setTraceHint(rx, hint)
    if (trace) {
      Cache.of(rx.render).setup({trace})
      Cache.of(rx.pulse).setup({trace, priority})
    }
    else if (priority !== undefined)
      Cache.of(rx.pulse).setup({priority})
    return rx
  }
}

function createReactState<V>(hint?: string, trace?: Partial<Trace>, priority?: number): ReactState<V> {
  const h = hint || (R.isTraceOn ? getComponentName() : '<rx>')
  const rx = Action.runAs<Rx<V>>(h, false, trace, undefined, Rx.create, h, trace, priority)
  return {rx, cycle: 0}
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
  const i = lines.findIndex(x => x.indexOf(reactive.name) >= 0) || 6
  let result: string = lines[i + 1] || ''
  result = (result.match(/^\s*at\s*(\S+)/) || [])[1]
  return result !== undefined ? `<${result}>` : '<Rx>'
}
