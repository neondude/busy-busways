
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NYC_CENTER } from "../constants/constantsNYC";
import { markerStateSliceActions } from "../controllers/gameStateManager";
import { drawPolyline, getPathArray } from "../controllers/pathManager";
import "../css/App.css";

const PathCreator = () => {
  // use dispatch to send actions to the store
  const dispatch = useDispatch();
  // get markerSlice state from the store
  let markerSlice = useSelector((state) => {
    // filter markers with mode = VIEW_MODE and sort by timeChosen
    return Object.values(state.markerStateSlice)
    .filter(
        (marker) => marker.mode === "chosen"
        ).sort((a, b) => a.timeChosen - b.timeChosen)
        .map((marker) => marker.position);
  });

  const toggleCreateMode = () => {
    // dispatch action to set all markers to choosable
    dispatch(markerStateSliceActions.setAllMarkersModeChoosable());
  };

  const createPath = async () => {
    const pathArray = await getPathArray(markerSlice[0], markerSlice[1]);
    drawPolyline(pathArray);

  }
  return (
    <>
      <div className="path-creator">
        <div>
          <button onClick={toggleCreateMode}>toggle create mode</button>
        </div>
        <div>{JSON.stringify(markerSlice)}</div>
        <div>
            <button onClick={createPath}>createPath</button>
        </div>
      </div>
    </>
  );
};

export default PathCreator;
