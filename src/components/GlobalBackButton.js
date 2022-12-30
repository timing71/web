import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { ArrowBack } from "styled-icons/material";
import { Button } from "./Button";

const BBInner = styled(Button)`

  background-color: black;
  position: fixed;
  top: 1em;
  left: 1em;

  display: flex;
  align-items: center;

  & svg {
    display: inline-block;
    height: 1.5em;
    margin-right: 0.25em;
  }

`;

export const GlobalBackButton = ({ to=null }) => {
  const history = useHistory();

  return (
    <BBInner
      onClick={!!to ? () => history.push(to) : history.goBack}
    >
      <ArrowBack />
      Back
    </BBInner>
  );

};
