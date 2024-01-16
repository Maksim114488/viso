"use client";
import './App.css';
import React, { useEffect, useState } from 'react';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MarkerType } from './types/MarkerType';
import './firebaseConfig.ts';
import { getFirestore, addDoc, collection, getDocs, deleteDoc } from "firebase/firestore"

const GOOGLE_API = "AIzaSyCYnXn1uFY_OLyri8Q_K8tMj_oNZG37yys";
const GOOGLE_MAP_ID = "da4bbfff79c393b5";


export const App = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [open, setOpen] = useState<number>(0);
  const visoPosition = { lat: 49.81618897502661, lng: 23.995120717288337 };
  const db = getFirestore();

  const handleMapClick = (event) => {
    const newMarker: MarkerType = {
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng,
      timestamp: new Date().getTime().toString(),
      next: markers.length + 1,
    }
    setMarkers(current => [...current, newMarker]);
    saveItemToFirestore(newMarker);
  };

  const handleDragEnd = (e, id) => {
    const markerToUpdate = markers.find(mark => mark.next === id);
    if (markerToUpdate) {
      markerToUpdate.lat = e.latLng.lat();
      markerToUpdate.lng = e.latLng.lng();
    }
    saveItemToFirestore(markerToUpdate);
  };

  const saveItemToFirestore = async (item) => {
    const collectionRef = collection(db, 'markers');
    await addDoc(collectionRef, item);
    console.log('Array saved to Firestore');
  };

  const loadDataFromFirestore = async () => {
    const collectionRef = collection(db, 'markers');

    try {
      const querySnapshot = await getDocs(collectionRef);

      const dataArray = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dataArray.push(data);
      });

      setMarkers(dataArray)

      console.log('Data loaded from Firestore:', dataArray);
      return dataArray;
    } catch (error) {
      console.error('Error loading data from Firestore:', error);
      throw error;
    }
  };

  const clearCollection = async () => {
    const collectionRef = collection(db, 'markers');

    try {
      const querySnapshot = await getDocs(collectionRef);

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log("Collection markers cleared successfully.");
    } catch (error) {
      console.error("Error clearing collection markers:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadDataFromFirestore();
  }, [])

  return (
    <APIProvider apiKey={GOOGLE_API}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map
          zoom={11}
          center={visoPosition}
          mapId={GOOGLE_MAP_ID}
          onClick={handleMapClick}
          style={{ position: "relative" }}
        >
          <button
            className="clearButton"
            onClick={clearCollection}
          >
            Clear all markers
          </button>

          {markers.length && markers.map(mark => {
            if (open === mark.next) {
              return (
                <InfoWindow
                  position={mark}
                  onCloseClick={() => setOpen(0)}
                >
                  {`Marker №${mark.next}`}
                </InfoWindow>
              )
            }
            return (
              <>
                <AdvancedMarker
                  key={mark.timestamp}
                  position={mark}
                  draggable={true}
                  onDragStart={() => console.log(markers.length)}
                  onDragEnd={event => handleDragEnd(event, mark.next)}
                  onClick={() => setOpen(mark.next)}
                >
                  <Pin
                    glyph={mark.next.toString()}
                    glyphColor={"white"}
                  />
                </AdvancedMarker>
              </>
            )
          })}
        </Map>
      </div>
    </APIProvider>
  );
}

export default App;