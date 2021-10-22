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

`;

export const Page = ({ children }) => (
  <>
    <GlobalStyle />
    { children }
  </>
);
