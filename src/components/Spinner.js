import { useCallback } from "react";
import styled from "styled-components";
import { Button } from "./Button";

const Inner = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0.25em;
`;

const SpinnerButton = styled(Button)`

  width: 2em;
  height: 2em;
  padding: 0;


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
  font-family: ${ props => props.theme.site.headingFont };
  font-size: large;
  text-align: center;
  flex-grow: 1;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

`;

export const Spinner = ({ min, max, onChange, step = 1, value }) => {

  const spinUp = useCallback(
    () => {
      const nextValue = max !== undefined ? Math.min(max, value + step) : value + step;
      onChange(nextValue);
    },
    [max, onChange, step, value]
  );

  const spinDown = useCallback(
    () => {
      const nextValue = min !== undefined ? Math.max(min, value - step) : value - step;
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
