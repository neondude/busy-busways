import { useState } from 'react'
import { useSelector } from 'react-redux'
import { NYC_CENTER } from '../constants/constantsNYC'
import '../css/App.css'
import ClickPosDisplay from './ClickPosDisplay'
import PathCreator from './PathCreator'

function MainContainer() {

  return (
    <div className="main-ui-container">
      {/* <ClickPosDisplay></ClickPosDisplay>  */}
      <PathCreator></PathCreator>     
    </div>
  )
}

export default MainContainer
