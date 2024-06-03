import { Paypal } from "styled-icons/fa-brands";
import { ToggleMenuItem } from "./MenuItem";
import { PAYPAL_DONATE_LINK } from '../../../constants';

export const DonateLink = () => {
  return (
    <ToggleMenuItem
      onClick={() => window.open(PAYPAL_DONATE_LINK, "_blank" )}
      title="Thank you!"
    >
      <span>
        <Paypal size={24} />
      </span>
      <label>
        Donate via PayPal
      </label>
    </ToggleMenuItem>
  );
};
