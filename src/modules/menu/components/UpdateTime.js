import { dayjs } from '@timing71/common';
import { Update } from 'styled-icons/material';

import { useServiceState } from "../../../components/ServiceContext";

export const UpdateTime = () => {
  const { state } = useServiceState();

  return (
    <div>
      <Update
        size={16}
        title='Last updated'
      />
      { state?.lastUpdated ? dayjs(state.lastUpdated).format("HH:mm:ss") : '-' }
    </div>
  );
};
