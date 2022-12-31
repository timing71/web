import { dayjs } from '@timing71/common';
import styled from "styled-components";
import { Podcasts } from 'styled-icons/material';
import { Button } from './Button';

export const Series = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  padding: 0.5em;

  border-top-left-radius: 0.25em;
  border-bottom-right-radius: 0.25em;

  min-width: 40%;
  margin-right: 1em;
`;

export const SyndicateInner = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  padding: 0.5em 0.5em 0.25em 0.5em;

  border-top-right-radius: 0.25em;
  border-bottom-left-radius: 0.25em;

  font-size: small;

  text-align: right;

  & svg {
    width: 1.5em;
    margin-right: 0.25em;
    margin-bottom: 0.25em;
  }
`;

export const TopRow = styled.div`
  justify-self: flex-start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

export const Description = styled.div`
  padding: 0.5em;
  margin-top: 0.5em;
  text-align: center;
`;

export const BottomRow = styled.div`
  justify-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`;

export const Inner = styled.div`
  border: 1px solid ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
  border-radius: 0.25em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: #292929;

  transition: background-color 0.25s ease-in-out;

  &:hover {
    background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedHoverColor : props.theme.replay.hoverColor };
  }

  & ${Series}, & ${SyndicateInner} {
    background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedColor : props.theme.replay.color };
  }

  & ${Button}:not(:disabled) {
    border-color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
    color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
    background-color: black;

    &:hover {
      background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
      color: black;
    }
  }

  & a {
    text-decoration: none;
    color: white;
    transition: color 0.25s ease-in-out;

    &:hover {
      color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
    }
  }
`;

export const Syndicate = ({ name, url }) => {

  const content = (
    <>
      <Podcasts />
      {name}
    </>
  );

  return (
    <SyndicateInner title={`This event was run on the Timing71 network by ${name}.`}>
      <span>
        { url ? (<a href={url}>{content}</a>) : content }
      </span>
    </SyndicateInner>
  );
};

export const Duration = styled.div`
  background-color: #404040;
  color: white;
  padding: 0.5em;
  font-size: small;

  &:first-child {
    border-bottom-left-radius: 0.25em;
    border-top-right-radius: 0.25em;
  }

  &:last-child {
    border-bottom-right-radius: 0.25em;
    border-top-left-radius: 0.25em;
  }
`;


export const ServiceCard = ({ manifest, ...props }) => (
  <Inner
    data-id={manifest.id}
    syndicated={!!manifest.external}
    {...props}
  >
    <TopRow>
      <Series>{manifest.name}</Series>
      {
        manifest.external && (
          <Syndicate
            name={manifest.external.name}
            url={manifest.external.url}
          />
        )
      }
    </TopRow>
    <Description>
      {manifest.description}
    </Description>
    <BottomRow>
      {
        manifest.startTime && (
          <Duration>
            {dayjs(manifest.startTime * 1000).format('D MMM YYYY HH:mm')}
          </Duration>
        )
      }
      {
        manifest.source && (
          <Duration>
            <a
              // manifest.source[0] might contain escaped HTML entities e.g. &copy;
              dangerouslySetInnerHTML={{ __html: manifest.source[0] }}
              href={manifest.source[1]}
            />
          </Duration>
        )
      }
    </BottomRow>
  </Inner>
);
