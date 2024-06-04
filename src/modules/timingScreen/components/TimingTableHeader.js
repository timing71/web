import { Stat } from '@timing71/common';
import styled, { css } from "styled-components";
import { useSetting } from "../../settings";
import { Popover, PopoverDisclosure, Tooltip, TooltipReference, usePopoverState, useTooltipState } from 'reakit';
import { useCallback } from 'react';
import { Search } from 'styled-icons/material';
import { Input } from '../../../components/Forms';

const HeaderRow = styled.tr`
  background-color: black;
  position: sticky;
  top: 0;
`;

const HeaderInner = styled.th`
  font-family: Play, sans-serif;
  text-transform: uppercase;
  text-align: left;
  color: ${ props => props.theme.site.highlightColor };
  font-weight: normal;

  border-bottom: 2px solid ${ props => props.theme.site.highlightColor };

  user-select: none;
  cursor: pointer;

  &:hover {
    color: white;
  }

  &:focus-visible {
    outline: none;
  }

  ${
    props => props.$withTooltip && css`
      text-decoration: underline dotted;
      text-underline-offset: 4px;
    `
  }
`;

const Tip = styled.div`
  background-color: rgba(0, 0, 0, 0.85);

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  padding: 0.5em;

  text-transform: none;
  font-size: small;

  transition: opacity 250ms ease-in-out;
  opacity: 0;
  [data-enter] & {
    opacity: 1;
  }

  & input {
    margin-left: 0.5em;
  }
`;

const Header = ({ stat, ...props }) => {
  if (stat[2]) {
    return (
      <HeaderWithPopover stat={stat} />
    );
  }
  return (
    <HeaderInner {...props}>
      {stat[0]}
    </HeaderInner>
  );
};

const HeaderWithPopover = ({ stat }) => {
  const tooltip = useTooltipState({
    animated: 250,
    gutter: -1
  });
  return (
    <TooltipReference
      $withTooltip
      as={HeaderInner}
      {...tooltip}
    >
      {stat[0]}
      <Tooltip {...tooltip}>
        <Tip>
          {stat[2]}
        </Tip>
      </Tooltip>
    </TooltipReference>
  );
};

const CarNumberHeader = ({ setFocusedCarNum }) => {

  const popover = usePopoverState({
    animated: 250,
    gutter: -6
  });

  const goToCar = useCallback(
    (carNum) => {
      const rowElem = document.querySelector(`tr[data-car-number="${carNum}"]`);
      if (rowElem) {
        rowElem.scrollIntoView({ block: 'center' });
        setFocusedCarNum(`${carNum}`);
        return true;
      }
      return false;
    },
    [setFocusedCarNum]
  );

  const handleKeyUp = (evt) => {
    if (evt.key === 'Enter') {
      if (goToCar(evt.target.value)) {
        popover.hide();
        evt.target.value = '';
      }
      else {
        setFocusedCarNum(null);
      }
    }
  };

  return (
    <>
      <PopoverDisclosure
        as={HeaderInner}
        {...popover}
      >
        Num <Search size={14} />
        <Popover
          aria-label="Jump to car"
          hideOnClickOutside
          {...popover }
        >
          <Tip>
            Jump to:
            <Input
              defaultValue=''
              onKeyUp={handleKeyUp}
              size={5}
              type="text"
            />
          </Tip>
        </Popover>
      </PopoverDisclosure>
    </>
  );
};

export const TimingTableHeader = ({ manifest, setFocusedCarNum }) => {
  const [hiddenCols] = useSetting('columns.hidden', []);
  return (
    <thead>
      <HeaderRow>
        <HeaderInner>Pos</HeaderInner>
        {
          manifest.colSpec && manifest.colSpec.filter(
            stat => !hiddenCols.includes(stat[0])
          ).map(
            (stat, idx) => {
              if (stat[0] === Stat.NUM[0] && stat[1] === Stat.NUM[1] && stat[2] === Stat.NUM[2]) {
                return (
                  <CarNumberHeader
                    key={idx}
                    setFocusedCarNum={setFocusedCarNum}
                  />
                );
              }
              return (
                <Header
                  key={idx}
                  stat={stat}
                />
              );
            }
          )
        }
      </HeaderRow>
    </thead>
  );
};
