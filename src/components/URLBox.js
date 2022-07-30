import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useConnectionService } from '../ConnectionServiceProvider';
import { Button } from "./Button";
import { PlayArrow } from "styled-icons/material";
import { mapServiceProvider } from "../modules/services";
import { useHistory } from "react-router-dom";
import { Autocomplete } from "./Autocomplete";

const Wrapper = styled.div`

  grid-column: 1 / span 4;

  background-color: black;

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;
  font-size: x-large;

  display: flex;

  & > div {
    width: 100%;
    display: flex;

    & input {
      flex-grow: 1;
      background-color: black;
      color: ${ props => props.theme.site.highlightColor };
      border: none;
      border-radius: 0.25em;

      font-family: ${props => props.theme.site.textFont};
      font-size: x-large;

      padding: 0.75em;
    }
  }

  & > ${Button} {
    display: flex;
    font-size: x-large;
    align-items: center;
  }

`;

const useSourcesList = () => {
  const [sources, setSources] = useState([]);
  const cs = useConnectionService();
  useEffect(
    () => {
      if (cs) {
        cs.listRecentSources().then(setSources);
      }
    },
    [cs]
  );

  return sources;
};

const URLEntry = styled.div`
  color: ${props => props.theme.site.highlightColor};
  background-color:${ props => props.highlighted ? '#404040' : 'black' };
  font-family: ${props => props.theme.site.textFont};
  font-size: x-large;

  padding: 0.25em;

  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: '#404040';
  }
`;

const renderItem = (item, highlighted) => (
  <URLEntry
    highlighted={highlighted}
    key={item}
  >
    {item}
  </URLEntry>
);

const shouldItemRender = (item, url) => {
  return url === '' || (item && url && item.includes(url));
};

export const URLBox = () => {

  const sources = useSourcesList();

  const [url, setUrl] = useState('');

  const [isSupported, setSupported] = useState(false);

  const history = useHistory();

  const go = useCallback(
    (goUrl) => {
      history.push(`/start?source=${encodeURIComponent(goUrl)}`);
    },
    [history]
  );

  const handleUrlChange = useCallback(
    (newUrl, thenStart=false) => {
      setUrl(newUrl);
      const provider = mapServiceProvider(newUrl);
      setSupported(!!provider);
      if (!!provider && thenStart) {
        go(newUrl);
      }
    },
    [go]
  );

  return (
    <Wrapper>
      <Autocomplete
        getItemValue={i => i}
        inputProps={{
          placeholder: 'Enter the URL of a timing site, or click to show recent sources',
          spellCheck: false
        }}
        items={sources}
        onChange={e => handleUrlChange(e.target.value)}
        onSelect={(selectedUrl) => handleUrlChange(selectedUrl, true)}
        renderItem={renderItem}
        shouldItemRender={shouldItemRender}
        value={url}
        wrapperStyle={null}
      />
      <Button
        disabled={!url || !isSupported}
        onClick={() => go(url)}
      >
        Go
        <PlayArrow size={24} />
      </Button>
    </Wrapper>
  );
};
