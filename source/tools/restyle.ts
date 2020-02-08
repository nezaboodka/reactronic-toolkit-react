// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { cached, Transaction } from 'reactronic'

export function restyle<T>(generate: () => T): Restyler<T> {
  return Transaction.run('restyle', () => new Restyler<T>(generate))
}

export class Restyler<T> {
  constructor(private readonly restyler: () => T) {
  }

  @cached
  protected style(): T {
    return this.restyler()
  }

  get css(): T {
    return this.style()
  }
}
