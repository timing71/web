import styled from "styled-components";

export const Section = styled.div`
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.5em;

  width: 75%;
  margin: 1em;
  padding: 0;

  background-color: #202020;

  & > h2 {
    margin: 0;
    padding: 0.5em;
    border-bottom: 1px solid ${ props => props.theme.site.highlightColor };
    font-family: ${ props => props.theme.site.headingFont };
    background-color: black;
    border-radius: 0.5em 0.5em 0 0;
  }

  & > p {
    padding: 0 2em;
  }

  li {
    margin: 1em;
  }

`;
