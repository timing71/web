import { useCallback } from 'react';
import { Table, useVirtual } from  'af-virtual-scroll';
import styled from 'styled-components';

import dayjs from '../../../datetime';

import { Message } from '../../../components/Message';

const MessageTableContainer = styled.div`
  height: 100%;

  .afvscr-list, .afvscr-table {
    overflow: auto;
    min-height: 0;
    height: 100%;
  }

  .afvscr-table {
    position: relative;

    table {
      /* flex-grow on table makes rows to stretch on firefox */
      flex: 0 1 auto;
      table-layout: fixed;
      min-width: 100%;
    }

    thead,
    tfoot {
        white-space: nowrap;
    }

    td,
    th {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    thead td,
    thead th,
    tfoot td,
    tfoot th {
        position: sticky;
        z-index: 1;
    }

    thead td,
    thead th {
        top: 0;
    }

    tfoot td,
    tfoot th {
        bottom: 0;
    }
  }

  .afvscr-table > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    visibility: hidden;
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

export const MessagesList = ({ messages }) => {

  const tableModel = useVirtual({
    itemCount: messages.length,
    estimatedItemSize: 28
  });

  const renderRow = useCallback(
    (rowIndex) => {
      const msg = messages[rowIndex];
      return (
        <Message
          key={rowIndex}
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
    <MessageTableContainer>
      <Table
        columns={columns}
        getRowData={i => messages[i]}
        headless
        model={tableModel}
        renderRow={renderRow}
      />
    </MessageTableContainer>
  );
};
