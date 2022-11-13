import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NYC_CENTER } from "../constants/constantsNYC";
import { drawAndAnimateBus, removeBus } from "../controllers/busOverlayManager";
import { markerStateSliceActions, pathControlSliceActions } from "../controllers/gameStateManager";
import { getMarkerPcount, getPositionHash } from "../controllers/markerManager";
import {
  draw3dPath,
  getPathData,
  remove3dPath,
} from "../controllers/pathManager";
import "../css/App.css";
import { map } from "../main";
import PathPanel from "./PathPanel";

const PathCreator = () => {
  // use dispatch to send actions to the store
  const dispatch = useDispatch();
  const [selectedPathPanel, setSelectedPathPanel] = useState(null);
  const [heading, setHeading] = useState(0);
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
    // console.log(state)
    return state.pathControlSlice;
  });

  const selectPathPanel = (index) => {
    setSelectedPathPanel(index);
  };

  const activatePathCreateMode = () => {
    dispatch(markerStateSliceActions.setAllMarkersModeChoosable());
  };

  const cancelPathSelection = () => {
    dispatch(markerStateSliceActions.setAllMarkersModeView());
    selectPathPanel(null);
  };
  
  const saveSelectedPath = async (index) => {
    if (chosenMarkers.length < 2) {
      alert("Please choose at least 2 markers");
      return;
    }
    let { pathArray, pathHash, legDistances} = await getPathData(chosenMarkers);
    draw3dPath(pathArray,pathControlSlice[index].color, index);
    drawAndAnimateBus(pathArray, legDistances, chosenMarkers, (position) => {
      console.log("waypoint reached", position, getPositionHash(position) )
    });

    dispatch(pathControlSliceActions.addPathHash({pathHash, index}));
    dispatch(markerStateSliceActions.setAllMarkersModeView());
    selectPathPanel(null);
  }  
  
  const destroyPath = (index) => {
    remove3dPath(pathControlSlice[index].pathHash);
    dispatch(pathControlSliceActions.addPathHash({pathHash:null, index}));
    removeBus(pathControlSlice[index].pathHash)

  };

  const addPassanger = () => {
    dispatch(markerStateSliceActions.addRandomPassenger());
  }

  const rotateMap = () => {
    map.setHeading(heading + 1);
    setHeading(map.getHeading());
  }

  return (
    <>
    <button onClick={addPassanger}>Add Passanger</button>
    {/* button to set heading */}
    <button onClick={() => rotateMap()}>Rotate {heading}</button>
      {Object.entries(pathControlSlice).map(([key, value]) => {
        return (<>
          <PathPanel
            key={key}
            panelColor={value.color}
            pathHash={value.pathHash}
            onClickToggle={() => selectPathPanel(selectedPathPanel === key ? null : key)}
            onClickCreate={activatePathCreateMode}
            createModeActive={createModeActive}
            onClickCancel={cancelPathSelection}
            onClickDestroy={()=>destroyPath(key)}
            onClickSave={()=>saveSelectedPath(key)}
            showPathPanel={selectedPathPanel === key}
          />
        </>
        );
      })}
      <div className="path-creator">
        {/* loop through all pathControlSlice key and values*/}

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
