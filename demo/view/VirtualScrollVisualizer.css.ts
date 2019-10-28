// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'
import { restyle } from '../../source/restyle'

export const style = restyle(() => {
  return {
    main: css`
      label: main;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);

      i {
        font-style: normal;
        opacity: 0.25;
        font-size: smaller;
      }
    `,
    device: css`
      label: device;
      border: 1px solid white;
      color: white;
    `,
    grid: css`
      label: grid;
      border: 1px solid #8DFFA6;
      color: #8DFFA6;
    `,
    dataport: css`
      label: dataport;
      border: 1px solid #FFFFA0;
      color: #FFFFA0;
    `,
    viewport: css`
      label: viewport;
      border: 1px solid white;
      color: white;
    `,
    area: css`
      label: area;
      display: grid;
      grid-template-columns: repeat(4, auto) 1fr 1fr repeat(4, auto);
      grid-template-rows: repeat(4, auto) 1fr 1fr repeat(4, auto);
      background-color: rgba(127, 127, 127, 0.1);
      box-shadow: 0.05em 0.05em 0.25em 1px black;
      padding: 0.25em 0;
      margin: 1em 1em;
    `,
    areaHint: css`
      label: areaHint;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaFrom: css`
      label: areaFrom;
      text-align: left;
      margin-left: 0.25em;
    `,
    areaTill: css`
      label: areaBottom;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaCenter: css`
      label: areaCenter;
      text-align: center;
    `,
    coords: css`
      display: inline-block;
      text-align: right;
    `,
    px: css`
      font-size: smaller;
    `,
  }
})