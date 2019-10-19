// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2016-2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import * as React from 'react'
import { trigger, separate, Cache } from 'reactronic'

export class Component<T> extends React.Component<T> {
  @trigger
  keepFresh(): void {
    if (Cache.of(this.render).invalid)
      separate(() => this.setState({}))
  }

  // @cached
  // render(): JSX.Element {
  // }

  componentWillUnmount(): void {
    separate(Cache.unmount, this)
  }
}
