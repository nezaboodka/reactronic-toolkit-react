// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { cached, isolated, LoggingOptions, Reactronic as R, Reactronic, Reentrance, reentrance, Stateful, stateless, Transaction, trigger } from 'reactronic'

export type ReactiveOptions = {
  hint: string,
  logging: Partial<LoggingOptions>,
  priority: number,
  transaction: Transaction
}

export function reactive(render: (cycle: number) => JSX.Element, options?: Partial<ReactiveOptions>): JSX.Element {
  const [state, refresh] = React.useState<ReactState<JSX.Element>>(
    !options ? createReactState : () => createReactState(options.hint, options.logging, options.priority))
  const rx = state.rx
  rx.cycle = state.cycle
  rx.doRefresh = refresh // just in case React will change refresh on each rendering
  React.useEffect(rx.unmount, [])
  return rx.render(render, options ? options.transaction : undefined)
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
  render(render: (cycle: number) => V, tran?: Transaction): V {
    return tran ? tran.inspect(() => render(this.cycle)) : render(this.cycle)
  }

  @trigger @reentrance(Reentrance.RunSideBySide)
  protected refresh(): void {
    if (Reactronic.getCache(this.render).invalid)
      isolated(this.doRefresh, {rx: this, cycle: this.cycle + 1})
  }

  @stateless cycle: number = 0
  @stateless doRefresh: (next: ReactState<V>) => void = nop
  @stateless readonly unmount = (): (() => void) => {
    return (): void => { isolated(Transaction.run, 'unmount', Reactronic.unmount, this) }
  }

  static create<V>(hint?: string, logging?: LoggingOptions, priority?: number): Rx<V> {
    const rx = new Rx<V>()
    if (hint)
      R.setLoggingHint(rx, hint)
    if (logging) {
      Reactronic.getCache(rx.render).configure({logging})
      Reactronic.getCache(rx.refresh).configure({logging, priority})
    }
    else if (priority !== undefined)
      Reactronic.getCache(rx.refresh).configure({priority})
    return rx
  }
}

function createReactState<V>(hint?: string, logging?: Partial<LoggingOptions>, priority?: number): ReactState<V> {
  const h = hint || (R.isLogging ? getComponentName() : '<rx>')
  const rx = Transaction.runAs<Rx<V>>(h, false, logging, undefined, Rx.create, h, logging, priority)
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
