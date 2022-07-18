import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const FileLoaderContext = createContext(null);

export const FileLoaderContextProvider = ({ children }) => {
  const [acceptedTypes, setAcceptedTypes] = useStateCallback(null);
  const [file, setFile] = useState(null);
  const inputElem = useRef();
  const callback = useRef();

  const handleFileChange = useCallback(
    (e) => {
      setFile(e.target.files[0]);
    },
    []
  );

  useEffect(
    () => {
      if (callback.current) {
        if (file) {
          callback.current.resolve(file);
        }
        else {
          callback.current.reject();
        }
        callback.current = null;
      }
    },
    [file]
  );

  const loadFile = useCallback(
    (acceptTypes='*') => {
      return new Promise(
        (resolve, reject) => {

          setAcceptedTypes(
            acceptTypes,
            () => {
              if (inputElem.current) {
                callback.current = { resolve, reject };
                inputElem.current.click();
              }
              else {
                reject();
              }
              setAcceptedTypes(null);
            }
          );
        }
      );

    },
    [setAcceptedTypes]
  );

  const clearFile = useCallback(
    () => setFile(null),
    []
  );

  return (
    <FileLoaderContext.Provider value={{ clearFile, file, loadFile }}>
      <input
        accept={acceptedTypes}
        onChange={handleFileChange}
        ref={inputElem}
        style={{ display: 'none' }}
        type='file'
      />
      { children }
    </FileLoaderContext.Provider>
  );
};

export const useFileContext = () => useContext(FileLoaderContext);


// https://stackoverflow.com/a/61842546/11643
function useStateCallback(initialState) {
  const [state, setState] = useState(initialState);
  const cbRef = useRef(null); // init mutable ref container for callbacks

  const setStateCallback = useCallback((state, cb) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(state);
  }, []); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `null` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}
