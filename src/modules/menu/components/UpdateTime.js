import { useCallback, useEffect, useState } from 'react';
import { dayjs } from '@timing71/common';
import styled, { css } from 'styled-components';
import { Update } from 'styled-icons/material';

import { useSetting } from "../../settings";
import { useServiceState } from "../../../components/ServiceContext";
import { flashyAnim } from '../../../theme';

const UpdateTimeInner = styled.div`

  user-select: none;

  ${ props => props.$warning && !props.$critical && css`
    color: yellow;
  ` }

  ${ props => props.$critical && css`
    color: red;
    animation: ${flashyAnim}
  ` }

`;

export const UpdateTime = () => {
  const { state } = useServiceState();
  const [delay] = useSetting('delay');

  const lastUpdated = state?.lastUpdated ? dayjs(state.lastUpdated) : null;

  const [delta, setDelta] = useState(0);

  const updateDelta = useCallback(
    () => {
      const now = dayjs();
      if (lastUpdated) {
        const diff = now.diff(lastUpdated, 'second');
        setDelta(diff - delay);
      }
    },
    [delay, lastUpdated]
  );

  useEffect(
    () => {
      updateDelta();
      const interval = setInterval(updateDelta, 1000 );
      return () => {
        clearInterval(interval);
      };
    },
    [delay, updateDelta]
  );

  return (
    <UpdateTimeInner
      $critical={delta >= 60}
      $warning={delta >= 30}
    >
      <Update
        size={16}
        title='Last updated'
      />
      { lastUpdated ? lastUpdated.format("HH:mm:ss") : '-' }
    </UpdateTimeInner>
  );
};
