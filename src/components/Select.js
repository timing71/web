import styled from 'styled-components';

export const Select = styled.select`

  background-color: black;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;
  color: ${ props => props.theme.site.highlightColor };

  font-family: ${ props => props.theme.site.headingFont };
  font-size: 1em;

  margin-right: 0.5em;
  margin-bottom: 0.5em;
  padding: 0.25em;

  outline: 0;

`;


export const Option = styled.option`
  background-color: black;
  color: ${ props => props.theme.site.highlightColor };
`;
