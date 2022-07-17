import InlineSVG from 'react-inlinesvg';
import styled, { css, keyframes } from 'styled-components';

import logoNoText from '../img/logo_no_text.svg';
import logo from '../img/logo.svg';

const spin = keyframes`
    0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
`;

export const Logo = styled(InlineSVG).attrs(props => ({
  src: !!props.$text ? logo : logoNoText,
}))`

  width: ${ props => props.size || '15vw' };

  ${
    props => !!props.$spin && css`
      .spinner_green {
        animation: ${spin} 5s linear infinite;
      }
      .spinner_yellow {
        animation: ${spin} 6s linear infinite;
      }
      .spinner_red {
        animation: ${spin} 4s linear infinite;
      }
    `
  }

`;
