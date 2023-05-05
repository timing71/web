import styled from "styled-components";
import { useCombobox } from 'downshift';
import { useEffect, useState } from "react";

const List = styled.div.attrs({ className: 'autocomplete-list' })`

  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 50vh;

  top: 100%;
  width: 100%;

  margin-left: -2px;
  margin-right: -2px;
`;

export const Autocomplete = ({ inputProps={}, items, onChange, onSelect, renderItem, shouldItemRender }) => {

  const [inputItems, setInputItems] = useState([]);

  useEffect(
    () => setInputItems(items),
    [items]
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter(i => shouldItemRender(i, inputValue))
      );
      onChange(inputValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      onSelect(selectedItem);
    }
  });

  return (
    <div
      className={isOpen ? 'open' : undefined}
      style={{ position: 'relative' }}
    >
      <input
        {...getInputProps()}
        {...inputProps}
      />
      <List {...getMenuProps()}>
        {
          isOpen && inputItems.map(
            (item, index) => renderItem(item, index === highlightedIndex, getItemProps({ item, index }))
          )
        }
      </List>
    </div>
  );
};
