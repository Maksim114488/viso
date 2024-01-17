"use client";
import './App.css';
import React, { useEffect, useState } from 'react';
import uuid from 'short-uuid';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  DocumentData, 
  setDoc, 
  doc,
} from "firebase/firestore";
import './firebaseConfig.ts';
import { MapMouseEvent } from '@vis.gl/react-google-maps/dist/components/map/use-map-events';
import { MarkerType } from './types/MarkerType';
import { Loader } from './Loader.tsx';

const GOOGLE_API = "AIzaSyCYnXn1uFY_OLyri8Q_K8tMj_oNZG37yys";
const GOOGLE_MAP_ID = "da4bbfff79c393b5";


export const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [open, setOpen] = useState<number>(0);
  const [isClickable, setIsClickable] = useState(true);
  const visoPosition = { lat: 49.81618897502661, lng: 23.995120717288337 };
  const db = getFirestore();

  const handleMapClick = (event: MapMouseEvent) => {
    if (!isClickable) return;
    if (event.detail.latLng) {
      const newMarker: MarkerType = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng,
        timestamp: new Date().getTime().toString(),
        next: markers.length + 1,
        id: uuid.generate(),
      }

      setMarkers(current => [...current, newMarker]);
      saveItemToFirestore(newMarker);
    }
  };

  const handleDragEnd = (e: google.maps.MapMouseEvent, id: number) => {
    const markerToUpdate = markers.find(mark => mark.next === id);

    if (markerToUpdate && e.latLng) {
      markerToUpdate.lat = e.latLng.lat();
      markerToUpdate.lng = e.latLng.lng();
      saveItemToFirestore(markerToUpdate);
    }
    setIsClickable(true);
  };

  const saveItemToFirestore = async (item: MarkerType) => {
    await setDoc(doc(db, 'markers', item.id), item, {merge: true});
    console.log('Array saved to Firestore');
  };

  const clearCollection = async () => {
    const collectionRef = collection(db, 'markers');

    try {
      const querySnapshot = await getDocs(collectionRef);

      setIsLoading(true);
      await Promise.all(querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      }))
      setIsLoading(false);

      console.log("Collection markers cleared successfully.");
    } catch (error) {
      console.error("Error clearing collection markers:", error);
      throw error;
    } 
    loadDataFromFirestore();
  };

  const loadDataFromFirestore = async () => {
    const collectionRef = collection(db, 'markers');

    try {
      const querySnapshot = await getDocs(collectionRef);
      console.log(querySnapshot);
      const dataArray: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dataArray.push(data);
      });

      setMarkers(dataArray as MarkerType[])

      console.log('Data loaded from Firestore:', dataArray);
      return dataArray;
    } catch (error) {
      console.error('Error loading data from Firestore:', error);
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

          {isLoading && (<Loader />)}

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
                  onDragStart={() => setIsClickable(false)}
                  onDragEnd={(event) => handleDragEnd(event, mark.next)}
                  onClick={event => setOpen(mark.next)}
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