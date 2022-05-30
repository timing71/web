import styled from "styled-components";
import { Page } from "./Page";

const FileChooser = styled.input.attrs(
  props => ({
    accept: props.accept || '.json,application/json',
    type: 'file'
  })
)``;

export const FileLoader = ({ accept, loadFile }) => (
  <Page>
    <h2>Select file</h2>
    <FileChooser
      accept={accept}
      onChange={(e) => loadFile(e.target.files[0])}
    />
  </Page>
);
