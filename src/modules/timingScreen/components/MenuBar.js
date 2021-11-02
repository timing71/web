import styled from "styled-components";
import { Menu } from "./Menu";
import { WallClock } from "./WallClock";

const Inner = styled.div`

  background-color: rgba(32, 32, 32, 0.9);

  position: fixed;
  left: 60vw;
  right: 0;
  bottom: 0;

  height: 2em;
  padding: 0.25em 0.5em;

  font-family: Play, Verdana, sans-serif;
  color: ${ props => props.theme.site.highlightColor };

  display: flex;
  flex-direction: row;

  align-items: center;
  justify-content: space-between;
`;

export const MenuBar = () => {
  return (
    <Inner>
      <WallClock />
      <Menu />
    </Inner>
  );
};
