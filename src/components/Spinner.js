import { useCallback } from "react";
import styled from "styled-components";

const Inner = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.25em;
`;

const SpinnerButton = styled.button`
  color: ${ props => props.theme.site.highlightColor };
  background-color: transparent;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  font-size: large;

  width: 2em;
  height: 2em;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
  }

  &:first-child {
    border-radius: 0.25em 0 0 0.25em;
  }

  &:last-child {
    border-radius: 0 0.25em 0.25em 0;
  }
`;

const SpinnerInput = styled.input`
  color: ${ props => props.theme.site.highlightColor };
  background-color: black;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-left: 0;
  border-right: 0;
  font-size: large;
  text-align: center;
  flex-grow: 1;
`;

export const Spinner = ({ min, max, onChange, step = 1, value }) => {

  const spinUp = useCallback(
    () => {
      const nextValue = max ? Math.max(max, value + step) : value + step;
      onChange(nextValue);
    },
    [max, onChange, step, value]
  );

  const spinDown = useCallback(
    () => {
      const nextValue = min ? Math.min(min, value - step) : value + step;
      onChange(nextValue);
    },
    [min, onChange, step, value]
  );

  return (
    <Inner>
      <SpinnerButton onClick={spinDown}>-</SpinnerButton>
      <SpinnerInput
        max={max}
        min={min}
        onChange={e => onChange(e.target.valueAsNumber)}
        type='number'
        value={value}
      />
      <SpinnerButton onClick={spinUp}>+</SpinnerButton>
    </Inner>
  );

};