import { Page } from "./Page";
import InlineSVG from 'react-inlinesvg';
import styled, { keyframes } from 'styled-components';

import logo from '../img/logo_no_text.svg';

const spin = keyframes`
    0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
`;

const SpinningLogo = styled(InlineSVG).attrs({
  src: logo
})`

  width: 20vw;

  .spinner_green {
      animation: ${spin} 5s linear infinite;
    }
    .spinner_yellow {
      animation: ${spin} 6s linear infinite;
    }
    .spinner_red {
      animation: ${spin} 4s linear infinite;
    }

`;

export const LoadingScreen = ({ message }) => (
  <Page>
    <SpinningLogo />
  </Page>
);
