// react component that toggles a div's visibility

import { useState } from "react";

const PathPanel = ({panelColor, onClickToggle, onClickSave, pathHash, onClickCreate, onClickCancel, onClickDestroy, showPathPanel, createModeActive} ) => {
  return (
    <>
      <div className="path-panel" 
      
      >
        <button disabled={createModeActive} style={{backgroundColor: panelColor}} onClick={() => onClickToggle()}></button>
        {/* {JSON.stringify(panelColor)} */}
        {showPathPanel && !pathHash && !createModeActive && <button onClick={onClickCreate} style={{backgroundColor: panelColor}}><svg width="25px" height="25px" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg></button>}
        {showPathPanel && pathHash && <button onClick={onClickDestroy} style={{backgroundColor: panelColor}}><svg width="25px" height="25px" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg></button>}
        {showPathPanel && createModeActive && <button onClick={onClickSave} style={{backgroundColor: panelColor}}><svg width="25px" height="25px" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff"><path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"/></svg></button>}
        {showPathPanel && createModeActive && <button onClick={onClickCancel} style={{backgroundColor: panelColor}}><svg width="25px" height="25px" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff" transform="rotate(45)"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg></button>}
      </div>
    </>
  );
};

export default PathPanel;