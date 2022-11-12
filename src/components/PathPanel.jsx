// react component that toggles a div's visibility

import { useState } from "react";

const PathPanel = ({panelColor, onClickToggle, onClickSave, pathHash, onClickCreate, onClickDestroy, showPathPanel, createModeActive} ) => {
  return (
    <>
      <div className="path-panel" 
      
      >
        <button disabled={createModeActive} style={{backgroundColor: panelColor}} onClick={() => onClickToggle()}>{JSON.stringify(panelColor)}</button>
        {showPathPanel && <button onClick={onClickCreate}>create path</button>}
        {showPathPanel && pathHash && <button onClick={onClickDestroy}>destroy path</button>}
        {showPathPanel && createModeActive && <button onClick={onClickSave}>save path</button>}
      </div>
    </>
  );
};

export default PathPanel;