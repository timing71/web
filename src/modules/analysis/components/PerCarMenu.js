import { CarSelection } from "./CarSelection";

export const PerCarMenu = ({ selectedCar, setSelectedCar }) => {
  return (
    <>
      <h4>Select a car</h4>
      <CarSelection
        onChange={e => setSelectedCar(e.target.value)}
        selectedCar={selectedCar}
      />
    </>
  );
};
