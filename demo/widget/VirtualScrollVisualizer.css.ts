// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'
import { restyle } from '../../source/restyle'

export const style = restyle(() => {
  return {
    main: css` label: main;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
    `,
    grid: css` label: grid;
      border: 0.5px solid gray;
      color: gray;
    `,
    gridTop: css` label: gridTop;
      text-align: center;
    `,
    gridBottom: css` label: gridBottom;
      text-align: center;
    `,
    gridLeft: css` label: gridLeft;
      margin-top: auto;
      margin-bottom: auto;
    `,
    gridRight: css` label: gridRight;
      text-align: center;
    `,
    dataport: css` label: dataport;
      border: 0.5px solid #FFFFA0;
      color: #FFFFA0;
      margin: 1em;
    `,
    viewport: css` label: viewport;
      border: 0.5px solid #8DFFA6;
      color: #8DFFA6;
      margin: 1em;
    `,

    area: css` label: grid;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
    `,
    areaTop: css` label: gridTop;
      text-align: left;
    `,
    areaBottom: css` label: gridBottom;
      text-align: right;
    `,
    areaLeft: css` label: gridLeft;
      text-align: center;
    `,
    areaRight: css` label: gridRight;
      text-align: center;
    `,
    areaCenter: css` label: gridRight;
      text-align: center;
    `,
  }
})
