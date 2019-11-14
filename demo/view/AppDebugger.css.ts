// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'

import { restyle } from '@reactronic-toolkit-react'

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
    component: css`
      label: component;
      border: 1px solid white;
      color: white;
    `,
    database: css`
      label: database;
      border: 1px solid silver;
      color: silver;
    `,
    dataArea: css`
      label: dataArea;
      border: 1px solid #FFFFA0;
      color: #FFFFA0;
    `,
    viewport: css`
      label: viewport;
      border: 1px solid #8DFFA6;
      color: #8DFFA6;
    `,
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
    areaOuter: css`
      label: areaParent;
      text-align: center;
    `,
    areaHint: css`
      label: areaHint;
      text-align: left;
      margin-left: 0.25em;
    `,
    areaFrom: css`
      label: areaFrom;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaTill: css`
      label: areaTill;
      text-align: right;
      margin-right: 0.25em;
    `,
    areaCenter: css`
      label: areaCenter;
      text-align: center;
    `,
    coords: css`
      display: inline-block;
      text-align: left;
    `,
    px: css`
      font-size: smaller;
    `,
  }
})
