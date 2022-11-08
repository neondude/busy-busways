import { map } from "../main";
let directionsService;

export const initDirectionsService = async () => {
    directionsService = await new google.maps.DirectionsService();
}
export const getPathArray = async (theOrigin, theDestination) => {
  const response = await directionsService.route({
    origin: theOrigin,
    destination: theDestination,
    travelMode: google.maps.TravelMode.DRIVING,
  });
//   console.log(response)
  return decodePolyline(response.routes[0].overview_polyline)
};

const decodePolyline = (encodedPath) => {
  if (!encodedPath) {
    return [];
  }
  var poly = [];
  var index = 0,
    len = encodedPath.length;
  var lat = 0,
    lng = 0;

  while (index < len) {
    var b,
      shift = 0,
      result = 0;

    do {
      b = encodedPath.charCodeAt(index++) - 63;
      result = result | ((b & 0x1f) << shift);
      shift += 5;
    } while (b >= 0x20);

    var dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encodedPath.charCodeAt(index++) - 63;
      result = result | ((b & 0x1f) << shift);
      shift += 5;
    } while (b >= 0x20);

    var dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    var p = {
      lat: lat / 1e5,
      lng: lng / 1e5,
    };
    poly.push(p);
  }
  return poly;
};

export const drawPolyline = (thePathArray) => {
  const lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: "#393",
    strokeWeight: "2px",
    fillOpacity: 0.8,
    fillColor: "#efefef",
  };
  const thePolyLinePath = new google.maps.Polyline({
    path: thePathArray,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 0,
    editable: false,
    icons: [
      {
        icon: lineSymbol,
        repeat: "24px",
      },
    ],
  });

  thePolyLinePath.setMap(map);
};