import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Inner, ServiceCard } from "../../../components/ServiceCard";
import { useSubscription } from "../../autobahn";


const ServiceList = styled.div`
  padding: 1em;

  & > ${Inner}:hover {
    cursor: pointer;
  }
`;


export const ServicesList = () => {

  const services = useSubscription('livetiming.directory', { get_retained: true });
  const history = useHistory();

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
            <ServiceCard
              key={s.uuid}
              manifest={s}
              onClick={() => history.push(`/hosted/${s.uuid}`)}
            />
          )
        )
      }
    </ServiceList>
  );
};
