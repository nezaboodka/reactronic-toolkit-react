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

      i {
        font-style: normal;
        opacity: 0.5;
        font-size: smaller;
      }
    `,
    grid: css` label: grid;
      border: 1px solid white;
      color: white;
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
      border: 1px solid #FFFFA0;
      color: #FFFFA0;
      margin: 1em;
    `,
    viewport: css` label: viewport;
      border: 1px solid #8DFFA6;
      color: #8DFFA6;
      margin: 1em;
    `,

    area: css` label: grid;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
    `,
    areaHint: css` label: gridTop;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaTop: css` label: gridTop;
      text-align: left;
      margin-left: 0.25em;
    `,
    areaBottom: css` label: gridBottom;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaCenter: css` label: gridRight;
      text-align: center;
    `,
  }
})
