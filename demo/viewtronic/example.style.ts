// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019-2020 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'

import { restyle } from '../../source/tools/restyle'

export const style = restyle(() => {
  return {
    app: css`
      label: app;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      margin: 1em;
      padding: 1em;
      border: 0.5px dashed gray;
    `,
    toolbar: css`
      label: toolbar;
      z-index: 100;
      display: flex;
      flex-direction: row;
      border: 0.5px dashed gray;
    `,
    toolbarItem: css`
      label: toolbarItem;
      margin: 1em;
      padding: 0.5em;
      border: 0.5px dashed gray;
    `,
    toolbarIcon: css`
      label: toolbarIcon;
    `,
    toolbarText: css`
      label: toolbarText;
    `,
  }
})
