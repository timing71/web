import LZString from "lz-string";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { ArrowBack, StackedBarChart } from "styled-icons/material";

import { LoadingScreen } from "../components/LoadingScreen";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { useSubscription } from "../modules/autobahn";
import { DelayIndicator, DelaySetting, Menu, MenuBar, MenuSeparator, Spacer, SystemMessage, ToggleMenuItem, UpdateTime, ViewSettings, WallClock } from "../modules/menu";
import { useDelayedState } from "../modules/network/hooks";
import { useSetting } from "../modules/settings";
import { TimingScreen } from "../modules/timingScreen";

export const HostedTiming = () => {
  const { params: { uuid } } = useRouteMatch();
  const services = useSubscription('livetiming.directory', { get_retained: true });
  const manifest = services?.find(s => s.uuid === uuid);

  const compressedServiceState = useSubscription(`livetiming.service.${uuid}`, { get_retained: true });
  const [lastUpdated, setLastUpdated] = useState();

  useEffect(
    // Legacy state doesn't include a lastUpdated timestamp
    // We splat serviceState after we include it so that we don't squash any
    // timestamp if it does appear in the upstream state.
    () => {
      setLastUpdated(Date.now());
    },
    [compressedServiceState]
  );

  const serviceState = compressedServiceState && JSON.parse(LZString.decompressFromUTF16(compressedServiceState));

  const state = {
    lastUpdated,
    ...(serviceState || {}),
    manifest
  };

  const [ delay ] = useSetting('delay', 0);

  const delayedState = useDelayedState(state, delay);

  const openAnalysis = useCallback(
    () => {
      window.open(`/hosted-analysis/${uuid}`);
    },
    [uuid]
  );

  const history = useHistory();

  if (serviceState && manifest) {
    return (
      <ServiceManifestContext.Provider value={{ manifest }}>
        <ServiceStateContext.Provider value={{ state: { ...delayedState, foo: 'bar' } }}>
          <TimingScreen>
            <MenuBar>
              <WallClock />
              <UpdateTime />
              <Spacer />
              <SystemMessage />
              <DelayIndicator />
              {
                process.env.NODE_ENV === 'development' && <span>[DEV]</span>
              }
              <Menu>
                <DelaySetting />
                <MenuSeparator />
                <ToggleMenuItem onClick={openAnalysis}>
                  <span>
                    <StackedBarChart size={24} />
                  </span>
                  <label>Launch analysis</label>
                </ToggleMenuItem>
                <MenuSeparator />
                <ViewSettings />
                <MenuSeparator />
                <ToggleMenuItem onClick={() => history.push('/')}>
                  <ArrowBack size={24} />
                  Back to home screen
                </ToggleMenuItem>
                {/* <DownloadReplay /> */}
              </Menu>
            </MenuBar>
          </TimingScreen>
        </ServiceStateContext.Provider>
      </ServiceManifestContext.Provider>
    );

  }
  else {
    return <LoadingScreen message='Loading timing data...' />;
  }
};
