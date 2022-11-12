import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NYC_CENTER } from "../constants/constantsNYC";
import { drawAndAnimateBus } from "../controllers/busOverlayManager";
import { markerStateSliceActions, pathControlSliceActions } from "../controllers/gameStateManager";
import {
  draw3dPath,
  getPathData,
  remove3dPath,
} from "../controllers/pathManager";
import "../css/App.css";
import PathPanel from "./PathPanel";

const PathCreator = () => {
  // use dispatch to send actions to the store
  const dispatch = useDispatch();
  const [pathHash, setPathHash] = useState("");
  const [selectedPathPanel, setSelectedPathPanel] = useState(null);
  // get markerSlice state from the store
  let chosenMarkers = useSelector((state) => {
    // filter markers with mode = VIEW_MODE and sort by timeChosen
    return Object.values(state.markerStateSlice)
      .filter((marker) => marker.mode === "chosen")
      .sort((a, b) => a.timeChosen - b.timeChosen)
      .map((marker) => marker.position);
  });

  let createModeActive = useSelector((state) => {
    // check if choosable mode exists in markerStateSlice
    return Object.values(state.markerStateSlice).some(
      (marker) => marker.mode === "choosable" || marker.mode === "chosen"
    );
  });

  let pathControlSlice = useSelector((state) => {
    console.log(state)
    return state.pathControlSlice;
  });

  const selectPathPanel = (index) => {
    setSelectedPathPanel(index);
  };

  const selectedPathCreateMode = () => {
    dispatch(markerStateSliceActions.setAllMarkersModeChoosable());
  };
  
  const saveSelectedPath = async (index) => {
    if (chosenMarkers.length < 2) {
      alert("Please choose at least 2 markers");
      return;
    }
    let { pathArray, pathHash, legDistances} = await getPathData(chosenMarkers);
    draw3dPath(pathArray,pathControlSlice[index].color, index);
    dispatch(pathControlSliceActions.addPathHash({pathHash, index}));
    dispatch(markerStateSliceActions.setAllMarkersModeView());
    selectPathPanel(null);
  }
  
  const destroyPath = (index) => {
    remove3dPath(pathControlSlice[index].pathHash);
    dispatch(pathControlSliceActions.addPathHash({pathHash:null, index}));

  };

  return (
    <>
      <div className="path-creator">
        <div>{selectedPathPanel}</div>
        {/* loop through all pathControlSlice key and values*/}
        {Object.entries(pathControlSlice).map(([key, value]) => {
          return (<>
            <PathPanel
              key={key}
              panelColor={value.color}
              pathHash={value.pathHash}
              onClickToggle={() => selectPathPanel(selectedPathPanel === key ? null : key)}
              onClickCreate={selectedPathCreateMode}
              createModeActive={createModeActive}
              onClickDestroy={()=>destroyPath(key)}
              onClickSave={()=>saveSelectedPath(key)}
              showPathPanel={selectedPathPanel === key}
            />
          </>
          );
        })}

        {chosenMarkers.map((marker, index) => {
          return (
            <div key={index}>
              {marker.lat}, {marker.lng}
            </div>
          );
        })}

      </div>
    </>
  );
};

export default PathCreator;
