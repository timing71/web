export const TimingTableHeader = ({ manifest }) => (
  <thead>
    <tr>
      {
        manifest.columnSpec && manifest.columnSpec.map(
          (stat, idx) => (
            <th key={idx}>{stat[0]}</th>
          )
        )
      }
    </tr>
  </thead>
);
