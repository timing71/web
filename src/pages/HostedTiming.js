import LZString from "lz-string";
import { useEffect } from "react";
import { useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { LoadingScreen } from "../components/LoadingScreen";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { useSubscription } from "../modules/autobahn";
import { DelayIndicator, DelaySetting, Menu, MenuBar, MenuSeparator, Spacer, SystemMessage, UpdateTime, ViewSettings, WallClock } from "../modules/menu";
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

  if (compressedServiceState && manifest) {
    const serviceState = JSON.parse(LZString.decompressFromUTF16(compressedServiceState));

    return (
      <ServiceManifestContext.Provider value={{ manifest }}>
        <ServiceStateContext.Provider value={{ state: { lastUpdated, ...serviceState, manifest } }}>
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
                {/* <ToggleMenuItem onClick={openAnalysis}>
                  <span>
                    <StackedBarChart size={24} />
                  </span>
                  <label>Launch analysis</label>
                </ToggleMenuItem>
                <MenuSeparator /> */}
                <ViewSettings />
                {/* <MenuSeparator />
                <DownloadReplay /> */}
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
