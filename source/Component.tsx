// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { trigger, cached, separate, Cache } from 'reactronic'

export class Component<P> extends React.Component<P> {
  @cached
  render(): JSX.Element {
    return <div>to be overridden in derived class</div>
  }

  @trigger
  keepFresh(): void {
    if (Cache.of(this.render).invalid)
      separate(() => this.setState({}))
  }

  componentDidMount(): void {
    this.keepFresh() // initial trigger run
  }

  componentWillUnmount(): void {
    separate(Cache.unmount, this)
  }

  shouldComponentUpdate(): boolean {
    return Cache.of(this.render).invalid
  }
}
