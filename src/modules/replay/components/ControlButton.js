import styled from 'styled-components';

export const ControlButton = styled.button`

  background-color: transparent;
  border: none;
  color: ${ props => props.theme.site.highlightColor };
  cursor: pointer;

  padding: 1px;

  &:hover {
    color: white;
  }

`;
