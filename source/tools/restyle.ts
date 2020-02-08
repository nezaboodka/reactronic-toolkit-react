// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cached, Transaction } from 'reactronic'

export function restyle<T>(generate: () => T): ReactiveStyle<T> {
  return Transaction.run('restyle', () => new ReactiveStyle<T>(generate))
}

export class ReactiveStyle<T> {
  constructor(private readonly restyler: () => T) {
  }

  @cached
  protected restyle(): T {
    return this.restyler()
  }

  get classes(): T {
    return this.restyle()
  }
}
