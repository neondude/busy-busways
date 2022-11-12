import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NYC_CENTER } from "../constants/constantsNYC";
import {
  
  drawAndAnimateBus,
} from "../controllers/busOverlayManager";
import { markerStateSliceActions } from "../controllers/gameStateManager";
import { draw3dPath, drawPolyline, getPathData } from "../controllers/pathManager";
import "../css/App.css";

const PathCreator = () => {
  // use dispatch to send actions to the store
  const dispatch = useDispatch();
  // get markerSlice state from the store
  let chosenMarkers = useSelector((state) => {
    // filter markers with mode = VIEW_MODE and sort by timeChosen
    return Object.values(state.markerStateSlice)
      .filter((marker) => marker.mode === "chosen")
      .sort((a, b) => a.timeChosen - b.timeChosen)
      .map((marker) => marker.position);
  });

  const toggleCreateMode = () => {
    // dispatch action to set all markers to choosable
    dispatch(markerStateSliceActions.setAllMarkersModeChoosable());
  };

  const createPath = async () => {
    // check if markerSlice has at least 2 markers
    if (chosenMarkers.length < 2) {
      alert("Please choose at least 2 markers");
      return;
    }
    const {pathArray, legDistances} = await getPathData(chosenMarkers);
    console.log("legDistances", legDistances);
    // drawPolyline(pathArray);
    draw3dPath(pathArray);
  };

  const createBusAnimation = async () => {
    // check if markerSlice has at least 2 markers
    if (chosenMarkers.length < 2) {
      alert("Please choose at least 2 markers");
      return;
    }
    const pathArray = await getPathData(chosenMarkers[0], chosenMarkers[1]);
    drawAndAnimateBus(pathArray);
    // draw3dPath(pathArray);
  };
  return (
    <>
      <div className="path-creator">
        <div>
          <button onClick={toggleCreateMode}>toggle create mode</button>
        </div>

        {/* chosenMarkers as a list of divs */}
        {chosenMarkers.map((marker, index) => {
          return (
            <div key={index}>
              {marker.lat}, {marker.lng}
            </div>
          );
        })}

        <div>
          <button onClick={createPath}>createPath</button>
        </div>
        <div>
          <button onClick={createBusAnimation}>createBusAnimation</button>
        </div>
      </div>
    </>
  );
};

export default PathCreator;
