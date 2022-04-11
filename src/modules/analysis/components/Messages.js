import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import { useAnalysis } from './context';
import { MessagesList } from './MessagesList';
import { MenuItem } from './MenuItem';

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
`;

const FiltersContainer = styled.div`
  padding: 0.5em;

  & h3 {
    margin-top: 0;
  }

  & ul {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    margin-right: 0.5em;
    padding: 0;

    overflow-y: auto;

    & a, & button {
      border-right: 1px solid transparent;
      border-left: 0;
      border-radius: 0 0.25em 0.25em 0;
      width: 100%;
      text-align: left;
    }
  }
`;

export const Messages = observer(
  () => {

    const analysis = useAnalysis();

    const messages = analysis.messages.messages;

    const [activeCategory, setActiveCategory] = useState(null);

    const categories = [...new Set(
      messages.map(
        m => m.category
      )
    )].sort();

    const filteredMessages = useMemo(
      () => !activeCategory ? messages : messages.filter(m => m.category === activeCategory),
      [activeCategory, messages]
    );

    return (
      <>
        <Helmet>
          <title>Messages</title>
        </Helmet>
        <Container>
          <MessagesList messages={filteredMessages} />
          <FiltersContainer>
            <h3>Filters</h3>
            <ul>
              <MenuItem
                current={null === activeCategory}
                onClick={() => setActiveCategory(null)}
              >
                <button>
                  All
                </button>
              </MenuItem>
              {
                categories.map(
                  (c, i) => (
                    <MenuItem
                      current={c === activeCategory}
                      key={i}
                      onClick={() => setActiveCategory(c)}
                    >
                      <button>
                        {c}
                      </button>
                    </MenuItem>
                  )
                )
              }
            </ul>
          </FiltersContainer>
        </Container>
      </>
    );
  }
);
