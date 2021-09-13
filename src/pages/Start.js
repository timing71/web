import { PluginDetector } from '../modules/pluginBridge';
import { mapServiceProvider } from '../modules/services';

export const Start = ({ location: { search } }) => {

  const usp = new URLSearchParams(search);
  const source = usp.get('source');

  const Service = mapServiceProvider(source);

  if (Service) {
    return (
      <PluginDetector>
        <Service />
      </PluginDetector>
    );
  }

  return (
    <p>No service provider found for {source}</p>
  );

};
