import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Table, useVirtual } from  'af-virtual-scroll';
import dayjs from '../../../datetime';


import { Message } from '../../../components/Message';
import { useAnalysis } from './context';

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 1fr);
  height: 100%;
`;

const MessageTableContainer = styled.div`
  height: 100%;
  overflow: auto;

  .afvscr-table {
    position: relative;

    & > div {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      visibility: hidden;
    }
  }

  & table {
    flex: 0 1 auto;
    table-layout: fixed;
    min-width: 100%;
  }
`;

const FiltersContainer = styled.div`
  padding: 0.5em;

  & h3 {
    margin-top: 0;
  }
`;

const columns = [
  {
    dataKey: 'timestamp',
    label: 'Timestamp',
    render: (date) => {
      return dayjs(date).format('HH:mm:ss');
    }
  },
  {
    dataKey: 'category',
    label: 'Category'
  },
  {
    dataKey: 'message',
    label: 'Message'
  }
];

export const Messages = observer(
  () => {

    const analysis = useAnalysis();

    const messages = analysis.messages.messages;

    const tableModel = useVirtual({
      itemCount: messages.length,
      estimatedItemSize: 28
    });

    const renderRow = useCallback(
      (rowIndex) => {
        const msg = messages[rowIndex];
        return (
          <Message
            message={[
              msg.timestamp,
              msg.category,
              msg.message,
              msg.style
            ]}
          />
        );
      },
      [messages]
    );

    return (
      <>
        <Helmet>
          <title>Messages</title>
        </Helmet>
        <Container>
          <MessageTableContainer>
            <Table
              columns={columns}
              getRowData={i => messages[i]}
              headless
              model={tableModel}
              renderRow={renderRow}
            />
          </MessageTableContainer>
          <FiltersContainer>
            <h3>Filters</h3>
          </FiltersContainer>
        </Container>
      </>
    );
  }
);
