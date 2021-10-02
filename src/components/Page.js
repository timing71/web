import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`

  body {
    background: ${ props => props.theme.site.background };
    color: ${ props => props.theme.site.textColor };

    margin: 0;
    padding: 0;

    font-family: ${ props => props.theme.site.textFont };
  }

  a {
    color: ${ props => props.theme.site.highlightColor };

    &:hover {
      color: #BBFFFF;
    }
  }

`;

export const Page = ({ children }) => (
  <>
    <GlobalStyle />
    { children }
  </>
);
