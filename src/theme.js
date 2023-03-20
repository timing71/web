import { FlagState } from '@timing71/common';

import { css, keyframes } from "styled-components";

import chequer from './img/chequer.png';

const flashyKeyframes = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const blinkingAnim = keyframes`
  0% { background-color: #990000 }
  50% { background-color: black }
  100% { background-color: #990000 }
`;

const flashyAnim = css`${flashyKeyframes} 0.5s alternate infinite`;

export const Theme = {
  classColours: {
    'p': '#FFFFFF',
    'lmp1': '#FF0000',
    'p1': '#FF0000',
    'hypercar': '#FF0000',
    'hypercarh': '#FF0000',
    'dpi': '#FFFFFF',
    'lmp2': '#77AAFF',
    'p2': '#77AAFF',
    'lmp2pa': '#77AAFF',
    'lmp2p/a': '#77AAFF',
    'lmp3': '#DD00DD',
    'p3': '#DD00DD',
    'p31': '#FF661C',
    'p32': '#549FFF',
    'jsp4': '#FF5050',
    'cn': '#dbb700',
    'cn1': '#dbb700',
    'mpc': '#50C0FF',
    'gtlm': '#FF0000',
    'lmgte': '#FF4F00',
    'gte': '#FF4F00',
    'lmgteam': '#FF4F00',
    'lmgtepro': '#01FF01',
    'gt': '#FF4F00',
    'gtc': '#A0A0A0',
    'gtd': '#00dc67',
    'gtdpro': '#FF0000',
    'gt3': '#FFFF00',
    'gt3p': '#CCCCCC',
    'gt3sa': '#FFFF00',
    'gt3pa': '#daa520',
    'gt3g': '#dbb700',
    'gt4': '#FF4F00',
    'gt4s': '#ffc0cb',
    'gt4pa': '#ff00ff',
    'gs': '#2fabff',
    'tcr': '#FFFF00',
    'gt3pro': '#dbb700',
    'gt3am': '#CCCCCC',
    'at': '#CCCCCC',
    'gtx': '#FF0000',
    'sp2': '#77AAFF',
    'sp3': '#FF00FF',
    'tcx': '#FF00FF',
    'sp4': '#29d105',
    'sp4t': '#89d115',
    'sp3t': '#6e92ee',
    'sp6': '#77C0FA',
    'sp7': '#00FF00',
    'sp8': '#CC88CC',
    'sp8t': '#FF8888',
    'sp9pro': '#66FF66',
    'sp9pro-am': '#FFFF66',
    'sp10': '#FF4F00',
    'v2t': '#FFF0A0',
    'v3t': '#FFDD00',
    'v4': '#DDD0DD',
    'v5': '#F4A4FF',
    'v6': '#50C0FF',
    'vt3': '#CCCCCC',
    'vt2': '#cb67ec',
    '991': '#01FF01',
    'a2': '#ffb8b8',
    'tc': '#c5b6ff',
    'cup-x': '#FFFFFF',
    'klcup5': '#DDFFFF',
    'cup3': '#FFFFAA',
    'app': '#ff50a4',
    'apa': '#fdff50',
    'aam': '#cb67ec',
    'i': '#89d115',
    'inv': '#89d115',
    'a': '#FFFF00',
    'b': '#6e92ee',
    'c': '#f68002',
    'd': '#cb67ec',
    'e': '#FF4F00',
    'r': '#CCCCCC',
    'pro': '#f29b42',
    'proam': '#f0f33c',
    'am': '#1fcc67',
    'lbcup': '#1cc3ff',
    'silver': '#CCCCCC',
    'sil': '#CCCCCC',
    'pam': '#FFFF00',
    'h4': '#FFFFAA',
    'pa991': '#d22730'
  },
  carStates: {
    'RUN': {
      color: '#00FF00',
      rowBackground: ['#000000', '#202020'],
    },
    'PIT': {
      color: '#DC291E',
      rowBackground: ['#550000', '#5C0000'],
    },
    'FUEL': {
      color: 'white',
      rowBackground: ['#550000', '#5C0000'],
    },
    'OUT': {
      color: '#FF6418',
      rowBackground: ['#553300', '#603F00'],
    },
    'STOP': {
      color: 'grey',
      rowBackground: ['#000000', '#202020'],
      rowStyle: 'italic',
      rowColor: 'grey'
    },
    'RET': {
      color: 'grey',
      rowBackground: ['#000000', '#202020'],
      rowStyle: 'italic',
      rowColor: 'grey'
    },
    'N/S': {
      color: 'grey',
      rowBackground: ['#000000', '#202020'],
      rowStyle: 'italic',
      rowColor: 'grey'
    },
    'FIN': {
      color: 'transparent',
      background: css`left/1.7em repeat-x url(${chequer})`,
      rowBackground: ['#000000', '#202020'],
    }
  },
  messages: {
    'pit': {
      rowBackground: ['#550000', '#5C0000'],
      color: 'white'
    },
    'out': {
      rowBackground: ['#553300', '#603F00'],
      color: 'white'
    },
    'green': {
      rowBackground: ['#009900', '#009900']
    },
    'yellow': {
      rowBackground: ['#DDDD00', '#DDDD00'],
      rowColor: 'black'
    },
    'red': {
      rowBackground: ['#990000', '#990000'],
      rowColor: 'white'
    },
    'code60': {
      rowBackground: ['#ff53e3', '#ff53e3'],
      rowColor: 'white'
    },
    'pb': {
      rowColor: '#00FF00'
    },
    'sb': {
      rowColor: '#FF53E3'
    },
    'system': {
      rowColor: '#54FFFF'
    }
  },
  modifiers: {
    'old': 'yellow',
    'tyre-med': 'yellow',
    'tyre-soft': 'red',
    'tyre-inter': '#3ac82c',
    'tyre-wet': '#4491d2',
    'pb': '#00FF00',
    'sb': '#FF53E3',
    'sb-new': '#FF53E3',
    'fb-used': '#808080',
    'fb-active': '#00FF00',
    'attack-active': '#ff53e3'
  },
  flagStates: {
    [FlagState.GREEN]: {
      background: '#009900',
      color: 'white'
    },
    [FlagState.YELLOW]: {
      background: '#DDDD00',
      color: 'black',
    },
    [FlagState.RED]: {
      background: '#990000',
      color: 'white',
      animation: css`${blinkingAnim} 1s step-end alternate infinite`
    },
    [FlagState.SC]: {
      background: '#DDDD00',
      color: 'black',
      animation: flashyAnim
    },
    [FlagState.SLOW_ZONE]: {
      background: 'linear-gradient(0deg, black, #DDDD00, black) top/400% 400%',
      color: 'white',
      fill: 'url(#slow_zone)'
    },
    [FlagState.CAUTION]: {
      background: '#DDDD00',
      color: 'black',
      animation: flashyAnim
    },
    [FlagState.FCY]: {
      background: '#DDDD00',
      color: 'black',
      animation: flashyAnim
    },
    [FlagState.VSC]: {
      background: '#DDDD00',
      color: 'black',
      animation: flashyAnim
    },
    [FlagState.CODE_60]: {
      background: '#ff53e3',
      color: 'white',
      animation: flashyAnim
    },
    [FlagState.CODE_60_ZONE]: {
      background: 'linear-gradient(0deg, black, #ff53e3, black) top/400% 400%',
      color: 'white',
      fill: 'url(#code_60_zone)'
    },
    [FlagState.CHEQUERED]: {
      background: css`left/contain repeat-x url(${chequer})`,
      fill: 'url(#chequer)',
      color: 'transparent'
    },
    [FlagState.WHITE]: {
      background: 'white',
      color: 'black'
    },
    [FlagState.NONE]: {
      background: 'black',
      color: 'white'
    }
  },
  site: {
    background: 'black',
    textColor: 'white',
    highlightColor: '#54FFFF',
    headingFont: 'Play, Arial, Verdana, sans-serif',
    textFont: 'Verdana, Arial, Helvetica, sans-serif'
  },
  replay: {
    color: 'green',
    hoverColor: '#404040',
    buttonColor: '#00FF00',
    syndicatedColor: '#000099',
    syndicatedHoverColor: '#000066',
    syndicatedButtonColor: '#2090FF',
  }
};
