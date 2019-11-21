// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'

import { restyle } from '../tools/restyle'

export const style = restyle(() => {
  return {
    area: css`
      label: area;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
      background-color: rgba(127, 127, 127, 0.1);
      box-shadow: 0.05em 0.05em 0.2em 0.5px black;
      text-shadow: 0 0 2px black;
      padding: 0.25em 0;
      margin: 0.5em 1em;
    `,
    outer: css`
      label: outer;
      text-align: center;
    `,
    hint: css`
      label: hint;
      text-align: left;
      margin-left: 0.25em;
    `,
    from: css`
      label: from;
      text-align: right;
      margin-right: 0.25em;
    `,
    till: css`
      label: till;
      text-align: right;
      margin-right: 0.25em;
    `,
    center: css`
      label: center;
      text-align: center;
    `,
  }
})
