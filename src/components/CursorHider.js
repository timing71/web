import { useEffect, useRef, useState } from 'react';

export const CursorHider = ({ children, delay }) => {
  const [hidden, setHidden] = useState(false);
  const timeout = useRef();
  const elem = useRef();

  const style = {};
  if (hidden) {
    style.cursor = 'none';
  }

  const hide = () => {
    setHidden(true);
  };

  useEffect(
    () => {
      timeout.current = setTimeout(hide, delay);

      if (elem.current) {
        elem.current.addEventListener(
          "mousemove",
          () => {
            setHidden(false);
            if (timeout.current) {
              clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(hide, delay);
          }
        );
      }

      return () => {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
      };
    },
    [delay]
  );

  return (
    <div
      ref={elem}
      style={style}
    >
      {children}
    </div>
  );
};
