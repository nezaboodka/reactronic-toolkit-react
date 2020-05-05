// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { Cache, cached, isolated, Reactronic, Transaction, trigger } from 'reactronic'

export class RComponent<P> extends React.Component<P> {
  @cached
  render(): JSX.Element {
    return <div>to be overridden in derived class</div>
  }

  @trigger
  pulse(): void {
    if (this.shouldComponentUpdate())
      isolated(RComponent.refresh, this)
  }

  shouldComponentUpdate(): boolean {
    return Reactronic.getCache(this.render).invalid
  }

  componentDidMount(): void {
    this.pulse() // initial trigger run
  }

  componentWillUnmount(): void {
    isolated(Transaction.run, 'unmount', Reactronic.unmount, this)
  }

  static refresh<P>(self: RComponent<P>): void {
    self.setState({})
  }
}
