import styled from "styled-components";
import { PlayArrow, SkipNext, SkipPrevious } from "styled-icons/material";
import { Button } from "./Button";

const ButtonGroup = styled.div`

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

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & ${ButtonGroup} {
    margin-left: 1em;
  }
`;

const InversePlayArrow = styled(PlayArrow)`
  transform: rotate(180deg);
`;

export const Paginator = ({
  page,
  pages,
  seekPage
}) => {

  const localPageStart = Math.max(1, page - 5);
  const localPages = [...new Array(10)].map((_, a) => a + localPageStart);

  return (
    <Inner>
      Page {page} of {pages}
      <ButtonGroup>
        <Button
          disabled={page === 1}
          onClick={() => seekPage(1)}
        >
          <SkipPrevious />
        </Button>
        <Button
          disabled={page === 1}
          onClick={() => seekPage(page - 1)}
        >
          <InversePlayArrow />
        </Button>
        {
          localPages.map(
            (pageNo, idx) => (
              <Button
                active={pageNo === page}
                key={pageNo}
                onClick={() => seekPage(pageNo)}
              >
                { pageNo > 1 && idx === 0 ? '…' : '' }
                {pageNo}
                { pageNo < pages && idx === 9 ? '…' : '' }
              </Button>
            )
          )
        }
        <Button
          disabled={page === pages}
          onClick={() => seekPage(page + 1)}
        >
          <PlayArrow />
        </Button>
        <Button
          disabled={page === pages}
          onClick={() => seekPage(pages)}
        >
          <SkipNext />
        </Button>
      </ButtonGroup>
    </Inner>
  );
};
