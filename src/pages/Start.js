import { PluginDetector } from '../modules/pluginBridge';

export const Start = ({ location: { search } }) => {

  const usp = new URLSearchParams(search);

  return (
    <PluginDetector>
      <div>Start from {usp.get('source')}</div>
    </PluginDetector>
  );
};
