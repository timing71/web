import styled from "styled-components";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";

const Inner = styled.div`
  grid-area: data;

  border-top: 2px solid ${ props => props.theme.site.highlightColor };

  padding: 0.5em;
  padding-bottom: 2.5em;

  overflow-y: auto;
`;

const DataTable = styled.table`
  width: 100%;

  & th {
    color: ${ props => props.theme.site.highlightColor };
    text-align: right;
    font-weight: normal;
    font-family: ${ props => props.theme.site.headingFont };
    padding: 0.25em;
  }

  & td {
    padding: 0.25em;
  }
`;

export const DataPanel = () => {

  const { manifest } = useServiceManifest();
  const { state } = useServiceState();

  if (!state.session || !manifest) {
    return null;
  }

  const session = state.session;

  const spec = manifest.trackDataSpec || [];
  const data = session.trackData || [];

  const values = [];

  for (let i = 0; i < spec.length + 1; i += 2) {
    values.push(
      <tr key={i}>
        <th>{ spec[i] }</th>
        <td>{ data[i] }</td>
        <th>{ spec[i+1] }</th>
        <td>{ data[i+1] }</td>
      </tr>
    );
  }

  return (
    <Inner>
      <DataTable>
        <tbody>
          {
            values
          }
        </tbody>
      </DataTable>
    </Inner>
  );
};
