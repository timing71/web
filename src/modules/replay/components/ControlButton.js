import styled from 'styled-components';
import { StyledIconBase } from '@styled-icons/styled-icon';

export const ControlButton = styled.button`

  background-color: transparent;
  border: none;
  color: ${ props => props.theme.site.highlightColor };
  cursor: pointer;

  padding: 1px;

  & ${StyledIconBase} {
    margin-bottom: 0;
  }

  &:hover {
    color: white;
  }

`;
