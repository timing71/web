import { useEffect, useState } from 'react';
import styled from 'styled-components';

const DefaultImageComponent = styled.img``;

export const ImageChanger = ({ delay=10, imageComponent, images }) => {
  const [index, setIndex] = useState(0);

  useEffect(
    () => {
      const changeImage = () => {
        setIndex(
          prevIndex => {
            if (prevIndex === images.length - 1) {
              return 0;
            }
            else {
              return prevIndex + 1;
            }
          }
        );
      };

      const interval = setInterval(changeImage, delay * 1000);

      return () => {
        clearInterval(interval);
      };
    },
    [delay, images.length]
  );

    const ImageComponent = imageComponent || DefaultImageComponent;

    return (
      <ImageComponent
        src={images[index]}
      />
    );

};
