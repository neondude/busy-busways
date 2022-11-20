import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NYC_CENTER } from "../constants/constantsNYC";
import { drawAndAnimateBus, removeBus } from "../controllers/busOverlayManager";
import { dropOffPassenger, pickUpPassenger } from "../controllers/gameController";
import { markerStateSliceActions, pathControlSliceActions } from "../controllers/gameStateManager";
import { getMarkerPcount, getPositionHash, setAllMarkersModeChoosable, setAllMarkersModeView } from "../controllers/markerManager";
import {
  doesPathExist,
  draw3dPath,
  getPathData,
  getPathHash,
  remove3dPath,
} from "../controllers/pathManager";
import "../css/App.css";
import { map } from "../main";
import PathPanel from "./PathPanel";

const PathCreator = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  // use dispatch to send actions to the store
  const dispatch = useDispatch();
  const [selectedPathPanel, setSelectedPathPanel] = useState(null);
  const [heading, setHeading] = useState(map.getHeading());
  let currentScore = useSelector((state) => state.gameScoreSlice);
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
    if(doesPathExist(pathHash)){
      alert("Path already exists");
      return;
    }
    draw3dPath(pathArray,pathControlSlice[index].color, index);
    drawAndAnimateBus(pathArray, legDistances, chosenMarkers, (position, pathHash) => {
      const positionHash = getPositionHash(position);      
      console.log("waypoint reached", position, positionHash);
      pickUpPassenger(pathHash, positionHash);
      dropOffPassenger(pathHash, positionHash);
      
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


  return (
    <>
      <div className="score-card">{"Score: " + currentScore}</div>
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
      {/* button to show and hide */}
      <div className="path-panel">
        <button onClick={()=>setShowInstructions(!showInstructions)}>?</button>
      </div>
      {showInstructions && <pre style={{whiteSpace:"pre-line" }} className="instruction-card">
        {`- Passengers will be spawn at random markers.
        - You will gain 10 points if a passenger at a circle marker is dropppd off at a square marker and vice versa.
        - The game is over when any marker has 10 passengers.
        - You can create a path by selecting 2 or more markers and then selecting the save button.
        - You can destroy a path by clicking on a colored circle and selecting the trash button.`} 
        
        </pre>}
    </>
  );
};

export default PathCreator;
