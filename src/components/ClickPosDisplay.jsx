import useMapClickLocation from '../hooks/useMapClickLocation'



function ClickPosDisplay() {  
  const { clickLocation } = useMapClickLocation()
  return (<>
        <div>{`{lat: ${clickLocation.lat==undefined?"":clickLocation.lat}, `}</div>
      <div>{`lng: ${clickLocation.lng==undefined?"":clickLocation.lng} }`}</div>
  </>
  )
}

export default ClickPosDisplay
