// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'

import { restyle } from '.reactronic-toolkit-react'

export const style = restyle(() => {
  return {
    main: css`
      label: main;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
      font-size: smaller;

      i {
        font-style: normal;
        opacity: 0.25;
        font-size: smaller;
      }
    `,
    all: css`
      label: all;
      border: 1px solid silver;
      color: silver;
    `,
    surface: css`
      label: surface;
      border: 1px solid white;
      color: white;
    `,
    buffer: css`
      label: buffer;
      border: 1px solid #FFFFA0;
      color: #FFFFA0;
    `,
    viewport: css`
      label: viewport;
      border: 1px solid #8DFFA6;
      color: #8DFFA6;
    `,
  }
})
