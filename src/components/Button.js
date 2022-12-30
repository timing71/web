import { createContext, useContext } from "react";
import { ArrowDropDown } from "@styled-icons/material";
import { MenuButton as ReakitMenuButton, Menu, MenuItem } from "reakit/Menu";
import styled, { css } from "styled-components";

export const Button = styled.button`
  color: ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  background-color: transparent;
  border: 1px solid ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  font-family: ${ props => props.theme.site.headingFont };
  font-size: large;

  border-radius: 0.25em;
  padding: 0.5em;

  transition-property: background-color, color;
  transition-duration: 0.25s;

  cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer' };
  user-select: none;

  ${
    props => !props.disabled && css`
    &:hover {
      background-color: ${ props => props.danger ? 'red' : props.theme.site.highlightColor };
      color: ${ props => props.danger ? 'white' : 'black' };
      cursor: pointer;
    }`
  }

  ${
    props => !props.disabled && props.active && css`
      background-color: ${ props => props.danger ? 'red' : props.theme.site.highlightColor };
      color: ${ props => props.danger ? 'white' : 'black' };
    `
  }
`;

export const ButtonGroup = styled.div`

display: flex;
align-items: stretch;

& ${Button} {

  padding: 0.25em;
  min-width: 3em;

  & svg {
    height: 1.5em;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }

  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

}

`;

const MenuButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.25em;

  & > ${Button} {
    flex-grow: 1;

    &:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;

      & > svg {
        margin-right: 0.25em;
      }
    }

    &:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: 0;
      margin: 0;
      padding: 0;
    }
  }
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MenuContext = createContext();

export const MenuButton = ({ caption, children, disabled, icon, menuState, onClick }) => {
  return (
    <MenuContext.Provider value={menuState}>
      <MenuButtonWrapper>
        <Button
          disabled={disabled}
          onClick={onClick}
        >
          {icon}
          {caption}
        </Button>
        <ReakitMenuButton
          as={Button}
          disabled={disabled}
          {...menuState}
        >
          <ArrowDropDown size={32} />
        </ReakitMenuButton>
      </MenuButtonWrapper>
      <Menu
        aria-label={`${caption} menu`}
        {...menuState}
      >
        <MenuWrapper>
          {children}
        </MenuWrapper>
      </Menu>
    </MenuContext.Provider>
  );
};

const MenuButtonItemInner = styled(Button)`

  font-size: small;

  & > svg {
      margin-right: 0.5em;
    }

  &:not(:first-child) {
    border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  &:not(:last-child) {
    border-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:disabled {
    background-color: #202020;
  }
`;

export const MenuButtonItem = ({ onClick, ...props }) => {

  const { hide } = useContext(MenuContext);

  return (
    <MenuItem
      as={MenuButtonItemInner}
      onClick={() => { onClick(); hide(); }}
      {...props}
    />
  );
};
