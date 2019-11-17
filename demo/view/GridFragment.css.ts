// The below copyright notice and the license permission notice
// shall be included in all copies or substantial portions.
// Copyright (C) 2019 Yury Chetyrko <ychetyrko@gmail.com>
// License: https://raw.githubusercontent.com/nezaboodka/reactronic/master/LICENSE

import { css } from 'emotion'
import { restyle } from 'reactronic-toolkit-react'

export const style = restyle(() => {
  return {
    main: css`
      label: main;
    `,
    cell: css`
      label: cell;
      overflow: hidden;
      box-sizing: border-box;
      border-bottom: 0.5px dashed rgba(127, 127, 127, 0.5);
      border-right: 0.5px dashed rgba(127, 127, 127, 0.5);
      padding: 0 0.25em;
    `,
    fade: css`
      label: fade;
      animation: fade 0.1s ease;
      @keyframes fade {
        0% { color: transparent; }
      }
    `,
    scale: css`
      label: scale;
      animation: scale 0.2s ease-out;
      @keyframes scale {
        0% { transform: scaleY(0); transform-origin: 0 100%; }
      }
    `,
    blink1: css`
      label: blink1;
      animation: blink1a 1s ease;
      @keyframes blink1a {
        1% { background-color: violet; }
      }
      @keyframes blink1b {
        0% { transform: scaleY(0); transform-origin: 0; }
        100% { transform: scaleY(1); transform-origin: 0; }
      }
    `,
    blink2: css`
      label: blink2;
      animation: blink2a 1s ease;
      @keyframes blink2a {
        1% { background-color: violet; }
      }
      @keyframes blink2b {
        0% { transform: scaleY(0); transform-origin: 0; }
        100% { transform: scaleY(1); transform-origin: 0; }
      }
    `,
  }
})