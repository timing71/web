import { Helmet } from "react-helmet-async";
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { TimingTable } from "../../timingScreen";
import { useAnalysis } from "./context";
import { FocusedCarContextProvider } from '../../timingScreen/context';

export const Classification = () => {

  const analysis = useAnalysis();

  return (
    <ServiceManifestContext.Provider value={{ manifest: analysis?.manifest }}>
      <ServiceStateContext.Provider value={{ state: analysis.state }}>
        <Helmet>
          <title>Classification</title>
        </Helmet>
        <FocusedCarContextProvider>
          <TimingTable />
        </FocusedCarContextProvider>
      </ServiceStateContext.Provider>
    </ServiceManifestContext.Provider>
  );
};
