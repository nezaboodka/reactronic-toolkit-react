// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'

import { restyle } from '~/../source/reactronic-toolkit-react'

export const style = restyle(() => {
  return {
    main: css`
      label: main;
    `,
    cell: css`
      label: cell;
      overflow: hidden;
      box-sizing: border-box;
      border-bottom: 0.5px dashed #8DFFA6;
      border-right: 0.5px dashed #8DFFA6;
      padding: 0 0.25em;
      font-size: 50%;
    `,
    fade: css`
      label: fade;
      animation: fade 0.1s ease;
      @keyframes fade {
        0% { color: transparent; }
      }
    `,
    rollout: css`
      label: scale;
      animation: scale 0.2s ease-out;
      @keyframes scale {
        0% { transform: scaleY(0); transform-origin: 0 center; }
      }
    `,
    blink1: css`
      label: blink1;
      animation: blink1a 1s ease;
      @keyframes blink1a {
        1% { background-color: violet; }
      }
    `,
    blink2: css`
      label: blink2;
      animation: blink2a 2s ease;
      @keyframes blink2a {
        1% { background-color: yellow; }
      }
    `,
  }
})
