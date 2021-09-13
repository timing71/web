import { PluginDetector } from '../modules/pluginBridge/components/PluginDetector';

export const Start = ({ location: { search } }) => {

  const usp = new URLSearchParams(search);

  return (
    <PluginDetector>
      <div>Start from {usp.get('source')}</div>
    </PluginDetector>
  );
};
