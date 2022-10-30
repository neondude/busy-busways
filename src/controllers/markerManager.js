import { map, NYC_CENTER } from "../main"
import { gameState, gameStateObservable, markerListSelector } from "../state/gameStateManager";


let currentMarkers;


export const initMarkerManager = () => {
    currentMarkers = []
    gameStateObservable.subscribe({onNext: handleStateChange})
}

const handleStateChange = (state) => {
    const markerList = markerListSelector(state)
    for (const markerItem of markerList) {
        drawMarker(markerItem)
    }
}

const drawMarker = (position) => {
    const pinViewScaled = new google.maps.marker.PinView({
        scale: 1,
    });
    const markerView = new google.maps.marker.AdvancedMarkerView({
        map,
        position: position,
        content: pinViewScaled.element,
    });
}

