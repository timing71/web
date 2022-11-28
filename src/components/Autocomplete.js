import { cloneElement, useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const List = styled.div.attrs({ className: 'autocomplete-list' })`

  position: fixed;
  overflow: auto;
  max-height: 50%;
`;

export const Autocomplete = ({ items, onChange, onSelect, renderItem, shouldItemRender, value }) => {

  const [showList, setShowList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const inputRef = useRef();
  const [listStyle, setListStyle] = useState({});

  const filteredItems = useMemo(
    () => items.filter(i => shouldItemRender(i, value)),
    [items, shouldItemRender, value]
  );

  const open = useCallback(
    () => {
      setShowList(true);
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(inputRef.current);
        const marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
        const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
        const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
        setListStyle({
          top: rect.bottom + marginBottom,
          left: rect.left + marginLeft - 2,
          minWidth: rect.width + marginLeft + marginRight
        });
      }
    },
    []
  );

  const handleClick = useCallback(
    () => {
      const isInputFocused = inputRef.current && inputRef.current.ownerDocument && inputRef.current === inputRef.current.ownerDocument.activeElement;
      if (isInputFocused) {
        open();
      }
    },
    [open]
  );

  const ignoreBlur = useRef(false);

  const handleBlur = useCallback(
    () => {
      if (!ignoreBlur.current) {
        setShowList(false);
        setHighlightedIndex(null);
      }
    },
    []
  );

  const handleItemClick = useCallback(
    (item) => (event) => {
      ignoreBlur.current = true;
      onSelect(item);
      setShowList(false);
      event.preventDefault();
      ignoreBlur.current = false;
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch(event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(
            prevIndex => Math.min(
              filteredItems.length,
              (prevIndex === null ? -1 : prevIndex) + 1
            )
          );
          break;

          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(
              prevIndex => Math.max(
                0,
                (prevIndex === null ? filteredItems.length : prevIndex) - 1
              )
            );
            break;

          case 'Enter':
            if (event.keyCode === 13 && showList) {
              setShowList(false);

              if (highlightedIndex === null) {
                inputRef.current?.select();
              }
              else {
                event.preventDefault();
                const selectedItem = filteredItems[highlightedIndex];
                onSelect(selectedItem);
              }
            }
            break;

          case 'Escape':
            setShowList(false);
            setHighlightedIndex(null);
            break;

        default:
      }
    },
    [filteredItems, highlightedIndex, onSelect, showList]
  );

  const renderItemWithHandler = useCallback(
    (item, isHighlighted) => {
      const rendered = renderItem(item, isHighlighted);
      return cloneElement(
        rendered,
        {
          onClick: handleItemClick(item)
        }
      );
    },
    [handleItemClick, renderItem]
  );

  return (
    <div className={showList ? 'open' : undefined}>
      <input
        autoComplete='false'
        onBlur={handleBlur}
        onChange={onChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        type='text'
        value={value}
      />
      {
        showList && (
          <List style={listStyle}>
            {
              filteredItems.map(
                (item, index) => renderItemWithHandler(item, index === highlightedIndex)
              )
            }
          </List>
        )
      }
    </div>
  );
};
