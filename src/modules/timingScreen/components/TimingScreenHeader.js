import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { Clock, ClockInner } from "./Clock";
import { FlagPanel } from './FlagPanel';

export const TimingScreenHeader = () => {

  const { manifest } = useServiceManifest();
  const { state: { session } } = useServiceState();

  const useLaps = session && session.lapsRemain !== undefined;

  return (
    <>
      {
        session && session.timeElapsed >= 0 && (
          <Clock
            caption='elapsed'
            className='left'
            pause={session?.pauseClocks}
            seconds={session.timeElapsed}
          />
        )
      }
      <FlagPanel
        flag={session.flagState}
        text={`${manifest.name} - ${manifest.description}`}
      />
      {
        useLaps && (
          <ClockInner className='right'>
            {session.lapsRemain} lap{session.lapsRemain === 1 ? '' : 's'} remaining
          </ClockInner>
        )
      }
      {
        !useLaps && session && session.timeRemain >= 0 && (
          <Clock
            caption='remaining'
            className='right'
            countdown
            pause={session?.pauseClocks}
            seconds={session.timeRemain}
          />
        )
      }
    </>
  );
};
