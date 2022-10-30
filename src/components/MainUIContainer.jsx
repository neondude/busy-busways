import { useState } from 'react'
import { useSelector } from 'react-redux'
import '../css/App.css'
import { NYC_CENTER } from '../main'
import { addChosenMarker, markerListSelector } from '../state/gameStateManager'

function MainContainer() {
  // const [count, setCount] = useState(0)
  const choosenForPath = useSelector(markerListSelector)

  const addChosenPlace = () => {
    console.log("on click add place")
    addChosenMarker(NYC_CENTER)
  }

  return (
    <div className="main-ui-container">
      {
        choosenForPath &&
        <div>{JSON.stringify(choosenForPath)}</div>
      }
      <button onClick={addChosenPlace}>start marker</button>
    </div>
  )
}

export default MainContainer
