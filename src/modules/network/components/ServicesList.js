import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { ArrowForward } from "styled-icons/material";
import { useSubscription } from "../../autobahn";

const ServiceInner = styled.button`

  border: 1px solid #008800;
  background-color: black;
  display: block;
  color: white;
  width: 100%;
  font-size: medium;
  font-family: ${ props => props.theme.site.textFont };
  padding: 0;

  transition: background-color 0.15s ease-in-out;

  & h4 {
    margin: 0;
    padding: 0.5em;
    background-color: #008800;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & svg {
      width: 1.5em;
    }
  }

  & p {
    margin: 0.5em 1em;
  }

  &:hover {
    cursor: pointer;
    background-color: #404040;
  }

`;

const Service = ({ service }) => {
  const history = useHistory();

  return (
    <ServiceInner
      onClick={() => history.push(`/hosted/${service.uuid}`)}
    >
      <h4>{service.name} <ArrowForward /></h4>
      <p>{service.description}</p>
    </ServiceInner>
  );
};

const ServiceList = styled.div`
  padding: 1em;

  & > ${ServiceInner} {
    margin-bottom: 1em;
  }
`;


export const ServicesList = () => {

  const services = useSubscription('livetiming.directory', { get_retained: true });

  if (services === null) {
    return <p>Loading...</p>;
  }

  if (services.length === 0) {
    return (
      <p>None right now...</p>
    );
  }

  return (
    <ServiceList>
      {
        services.map(
          s => (
            <Service
              key={s.uuid}
              service={s}
            />
          )
        )
      }
    </ServiceList>
  );
};
