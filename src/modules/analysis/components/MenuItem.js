import styled from "styled-components";

export const MenuItem = styled.li`
  & > a, & > span {

    display: block;

    font-family: ${ props => props.theme.site.headingFont };

    text-decoration: none;

    margin-bottom: 0.125em;
    padding: 0.5em 1em;

    border-radius: 0.25em 0 0 0.25em;

  }

  & > a {
    background: linear-gradient(90deg, black 0 50%, ${ props => props.theme.site.highlightColor} 50% 100%) repeat-y;
    background-size: 200%;
    background-position: ${ props => props.current ? '100%' : '0'};
    color: ${ props => props.current ? 'black' : 'white' };
    border: 1px solid transparent;
    border-right: 0;

    cursor: pointer;

    &:hover {
      border-color: ${ props => props.current ? 'transparent' : props.theme.site.highlightColor};
      color: ${ props => props.current ? 'black' : props.theme.site.highlightColor};
    }

    transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out, background-position 0.15s ease-in-out;
  }

  & > span {
    color: #C0C0C0;
    cursor: not-allowed;
  }

`;
