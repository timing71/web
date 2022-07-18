import { useHistory } from "react-router-dom";
import { ArrowBack } from "styled-icons/material";
import { ToggleMenuItem } from "./MenuItem";

export const BackMenuItem = () => {
  const history = useHistory();

  return (
    <ToggleMenuItem
      onClick={history.goBack}
    >
      <span>
        <ArrowBack size={24} />
      </span>
      <label>
        Back to menu
      </label>
    </ToggleMenuItem>
  );
};
