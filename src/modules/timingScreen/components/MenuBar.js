import styled from "styled-components";
import { StyledIconBase } from '@styled-icons/styled-icon';

import { Menu } from "./Menu";
import { WallClock } from "./WallClock";
import { UpdateTime } from "./UpdateTime";
import { DelayIndicator } from './DelayIndicator';
import { SystemMessage, SystemMessageProvider } from "./SystemMessage";

const Spacer = styled.div`
  flex-grow: 1;
`;

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
  justify-content: flex-start;

  & > div:not(:first-child):not(:last-child) {
    margin-left: 1em;
  }

  & ${StyledIconBase} {
    margin-bottom: 2px;
    margin-right: 0.25em;
  }
`;

export const MenuBar = ({ fsHandle }) => {
  return (
    <Inner>
      <SystemMessageProvider>
        <WallClock />
        <UpdateTime />
        <Spacer />
        <SystemMessage />
        <DelayIndicator />
        <Menu fsHandle={fsHandle} />
      </SystemMessageProvider>
    </Inner>
  );
};
