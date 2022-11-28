import styled from "styled-components";
import { dayjs } from '@timing71/common';
import { Paypal } from 'styled-icons/fa-brands';

import { PAYPAL_DONATE_LINK } from "../constants";

const FooterInner = styled.div`

  display: flex;
  justify-content: space-around;
  align-self: stretch;

  padding: 1em;

  background-color: rgba(0, 0, 0, 0.6);
  border-top: 1px solid ${ props => props.theme.site.highlightColor };

  font-size: small;
`;

const CopyrightYear = () => (
  <span>
    2016–{ dayjs().format('YYYY') }
  </span>
);

const PP = styled(Paypal)`
  width: 1em;
`;

export const Footer = () => (
  <FooterInner>
    <span>
      Timing71 and Timing71 Beta are copyright &copy; <CopyrightYear /> James Muscat.
    </span>
    <a href="mailto:info@timing71.org">info@timing71.org</a>
    <a
      href={PAYPAL_DONATE_LINK}
      rel='noreferrer'
      target='_blank'
    >
      Donate via <PP /> PayPal
    </a>
    {
      process.env.NODE_ENV === 'development' && (
        <span>[DEV]</span>
      )
    }
  </FooterInner>
);
