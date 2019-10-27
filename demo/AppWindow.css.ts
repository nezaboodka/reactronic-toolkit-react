// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'
import { restyle } from '../source/restyle'

export const style = restyle(() => {
  return {
    main: css` label: main;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      overflow: hidden;
      font-family: Calibri, Tahoma, Arial, monospace;
      font-size: calc(16px + (24 - 16) * (100vw - 640px) / (1920 - 640));
      font-weight: 200;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
    `,
    scroll: css` label: scroll;
      margin: 10vh;
      overflow: scroll;
      border-top: 0.5px solid rgba(127, 127, 127, 0.2);
      border-left: 0.5px solid rgba(127, 127, 127, 0.2);
    `,
    content: css` label: content;
      height: 100em;
    `,
  }
})
