import { useMeasure } from '@nivo/core';

export const WidthResponsiveWrapper = ({ children, height }) => {
  const [measureRef, bounds] = useMeasure();
  const shouldRender = bounds.width > 0;

  return (
    <div
      ref={measureRef}
      style={{ width: '100%', height: '100%' }}
    >
      {shouldRender && children({ width: bounds.width, height })}
    </div>
  );
};
