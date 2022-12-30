import { Option, Select } from "../../../components/Forms";

const EARLIEST_YEAR = 2016;

export const YearSelection = ({ onChange, value }) => {
  const currentYear = new Date().getUTCFullYear();

  return (
    <Select
      onChange={onChange}
      value={value}
    >
      <Option value=''>All years</Option>
      {
        [...new Array(1 + currentYear - EARLIEST_YEAR)].map(
          (_, idx) => (
            <Option
              key={EARLIEST_YEAR + idx}
              value={EARLIEST_YEAR + idx}
            >
              {EARLIEST_YEAR + idx}
            </Option>
          )
        )
      }
    </Select>
  );

};
