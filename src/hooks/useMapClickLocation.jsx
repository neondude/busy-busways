import { useState, useEffect, useCallback } from "react";
import { map } from "../main";

const useClickLocation = () => {
  //   const [pressedKey, setPressedKey] = useState({code:undefined, key:undefined})
  const [clickLocation, setClickLocation] = useState({ clickLocation: {} });

  const handleClick = useCallback((mapsMouseEvent) => {
    setClickLocation({ clickLocation: mapsMouseEvent.latLng.toJSON() });
  }, []);

  useEffect(() => {
    map.addListener("click", handleClick);
    // document.addEventListener('keyup', handleAlphaKeyUp)

    return () => {
      map.addListener("click", handleClick);
      //   document.removeEventListener('keyup', handleAlphaKeyUp)
    };
  });

  return clickLocation;
};

export { useClickLocation as default };
