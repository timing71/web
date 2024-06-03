import styled from "styled-components";
import { useSetting } from "../../settings";
import { Tooltip, TooltipReference, useTooltipState } from 'reakit';
import { QuestionCircle } from 'styled-icons/fa-regular';

const HeaderRow = styled.tr`
  background-color: black;
  position: sticky;
  top: 0;
`;

const HeaderInner = styled.th`
  font-family: Play, sans-serif;
  text-transform: uppercase;
  text-align: left;
  color: #54FFFF;
  font-weight: normal;

  border-bottom: 2px solid #54FFFF;

  user-select: none;
`;

const Tip = styled.div`
  background-color: rgba(0, 0, 0, 0.85);

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  padding: 0.5em;

  transition: opacity 250ms ease-in-out;
  opacity: 0;
  [data-enter] & {
    opacity: 1;
  }
`;

const Q = styled(QuestionCircle)`
  padding-left: 0.25em;
  margin-top: -0.25em;
  display: inline;
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
    gutter: -6
  });
  return (
    <TooltipReference
      as={HeaderInner}
      {...tooltip}
    >
      {stat[0]}
      <Q size={14} />
      <Tooltip {...tooltip}>
        <Tip>
          {stat[2]}
        </Tip>
      </Tooltip>
    </TooltipReference>
  );
};

export const TimingTableHeader = ({ manifest }) => {
  const [hiddenCols] = useSetting('columns.hidden', []);
  return (
    <thead>
      <HeaderRow>
        <HeaderInner>Pos</HeaderInner>
        {
          manifest.colSpec && manifest.colSpec.filter(
            stat => !hiddenCols.includes(stat[0])
          ).map(
            (stat, idx) => (
              <Header
                key={idx}
                stat={stat}
              />
            )
          )
        }
      </HeaderRow>
    </thead>
  );
};
