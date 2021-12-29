import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`

  @import url('https://fonts.googleapis.com/css2?family=Play&display=swap');

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

  ::-webkit-scrollbar-track {
    background-color: #303030;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${ props => props.theme.site.highlightColor };
    border-radius: 2px;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${ props => props.theme.site.headingFont };
  }

`;

export const Page = ({ children }) => (
  <>
    <GlobalStyle />
    { children }
  </>
);
