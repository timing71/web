import { useContext, useEffect, useState } from "react";
import { PluginContext } from "../../pluginBridge";
import { Session } from "./session";

const TID_REGEX = /(?:new liveTiming.LiveTimingApp\()(?<service_data>[^;]+)\);/;
const getServiceData = async (source, port) => {
  const page = await port.fetch(source);
  const match = page.match(TID_REGEX);

  return JSON.parse(match.groups.service_data || 'null');

};

export const Service = ({ children, service, updateManifest, updateState }) => {

  const port = useContext(PluginContext);
  const [serviceData, setServiceData] = useState(null);

  useEffect(
    () => {
      getServiceData(service.source, port).then(setServiceData);
    },
    [port, service]
  );

  return (
    <>
      {
        serviceData && (
          <Session
            serviceData={serviceData}
            updateManifest={updateManifest}
            updateState={updateState}
          />
        )
      }
      {children}
    </>
  );
};

Service.regex = /livetiming\.getraceresults\.com\/[0-9a-zA-Z]+/;
