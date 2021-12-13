import { useState, useEffect } from 'react';
import axios from 'axios';
import { Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { iconBike, iconBikeCharge, iconBikeStopped, iconBikeChargeStopped } from './CustomMarkers';

function MapMarkers(props) {
    const url = process.env.REACT_APP_API_BASE_URL + '/api/bike';
    const stations_url = process.env.REACT_APP_API_BASE_URL + '/api/station';
    const [markers, setMarkers] = useState([]);
    const [stations, setStations] = useState([]);

    var map = useMap();

   function addToStation() {
        //Todo: Axios request to add bike to station.
    }

    useEffect(() => {
        const fetchData = () => {
            axios.get(url).then((res) => {
                let bikes = getBikesWithinBounds(res.data);
    
                setMarkers(bikes);
            })
        }

        const fetchStations = () => {
            axios.get(stations_url).then((res) => {
                let stations = getBikesWithinBounds(res.data);
    
                setStations(stations);
            })
        }

        const getBikesWithinBounds = (data) => {
            let bounds = map.getBounds();
                let bikesWithinBounds = [];
    
                let s = bounds.getSouth();
                let n = bounds.getNorth();
                let w = bounds.getWest();
                let e = bounds.getEast();
                
                for (let bike of data.bikes) {
                    if (bike.latitude >= s &&
                        bike.latitude <= n &&
                        bike.longitude >= w &&
                        bike.longitude <= e) {
                            bikesWithinBounds.push(bike);
                    }
    
                }
    
                return bikesWithinBounds;
        }

        // Fetching immediately the first time
        fetchData();
        fetchStations();

        // Fetching every 10 seconds
        const fetchDataInterval = setInterval(() => {
            fetchData();
            fetchStations();
        }, 10000);

        // Clearing is needed
        return () => clearInterval(fetchDataInterval);
    }, [url])

    return (
        <div>
            <MarkerClusterGroup>
                { markers.map((marker) => {
                    let icon = null;

                    marker.battery < 25 ? icon = iconBikeCharge
                    : !marker.active ? icon = iconBikeStopped
                    : !marker.active && marker.battery < 25 ? icon = iconBikeChargeStopped
                    : icon = iconBike;

                    return <Marker position={[marker.latitude, marker.longitude]} icon={icon} key={marker._id}>
                        {
                            !marker.active && marker.battery < 25 ?
                            <Popup>
                                <select>
                                    <option selected>
                                        Send to charger
                                    </option>
                                    {
                                        stations.map((station) => {
                                            return <option onClick={addToStation}>{ station.display_id }</option>
                                        })
                                    }
                                </select>
                            </Popup> :
                            <Popup>
                                Lat: { marker.latitude } 
                                <br /> Lan: { marker.longitude }
                                <br /> Battery: { marker.battery }
                                <br /> Speed: { marker.speed }
                            </Popup>
                        }
                        
                    </Marker>
                }) }
            </MarkerClusterGroup>
        </div>
    )
}

export default MapMarkers
