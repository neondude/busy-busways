import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './components/App'
import { NYC_CENTER } from './constants/constantsNYC'
import { initGame } from './controllers/gameController'
import './css/index.css'
import { gameState } from './controllers/gameStateManager'
import { PinComponent } from './components/PinComponent'

export let map;

const loadMap = async () => {
  map = await new google.maps.Map(document.getElementById("map"), {
    center: NYC_CENTER,
    zoom: 16,
    heading: 0,
    tilt: 30,
    mapId: "188985496c7786bd",
    // gestureHandling: 'greedy',
    mapTypeControl: false,
    zoomControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
  });
  
  
};

async function initMap() {
  await loadMap();
  initGame();

  customElements.define('pin-component',PinComponent);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={gameState}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

window.initMap = initMap;