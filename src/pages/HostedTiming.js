import LZString from "lz-string";
import { useRouteMatch } from "react-router-dom";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { useSubscription } from "../modules/autobahn";
import { TimingScreen } from "../modules/timingScreen";

export const HostedTiming = () => {
  const { params: { uuid } } = useRouteMatch();
  const services = useSubscription('livetiming.directory', { get_retained: true });
  const manifest = services?.find(s => s.uuid === uuid);

  const compressedServiceState = useSubscription(`livetiming.service.${uuid}`, { get_retained: true });

  if (compressedServiceState && manifest) {
    const serviceState = JSON.parse(LZString.decompressFromUTF16(compressedServiceState));

    return (
      <ServiceManifestContext.Provider value={{ manifest }}>
        <ServiceStateContext.Provider value={{ state: { ...serviceState, manifest } }}>
          <TimingScreen></TimingScreen>
        </ServiceStateContext.Provider>
      </ServiceManifestContext.Provider>
    );

  }
  else {
    return <p>Loading...</p>;
  }
};
