import React, { useEffect, useState } from "react";
import { useToast } from "./ToastContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Backend } from "../services/backend";
import { User } from "../types";

// Fix for default marker icon in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
  eventId: string;
  eventLat: number;
  eventLng: number;
  isLive: boolean; // Is the current user broadcasting?
}

interface PeerLocation {
  userId: string;
  avatar: string;
  lat: number;
  lng: number;
}

// Component to recenter map when "Go Live" is toggled
const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const LiveMap: React.FC<LiveMapProps> = ({
  eventId,
  eventLat,
  eventLng,
  isLive,
}) => {
  const [peers, setPeers] = useState<Record<string, PeerLocation>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myPosition, setMyPosition] = useState<{lat: number, lng: number} | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const user = Backend.Auth.getSession();
    setCurrentUser(user);
    
    // Subscribe to location updates
    const unsubscribe = Backend.API.subscribe("LOCATION", (payload: any) => {
        // payload: { eventId, userId, userAvatar, lat, lng }
        if (payload.eventId !== eventId) return;
        if (payload.userId === user?.id) return; // Ignore self (we track self locally)

        setPeers((prev) => ({
            ...prev,
            [payload.userId]: {
                userId: payload.userId,
                avatar: payload.userAvatar,
                lat: payload.lat,
                lng: payload.lng,
            }
        }));
    });

    return () => unsubscribe();
  }, [eventId]);

  // Simulate broadcasting location if isLive is true
  // Broadcast real location if isLive is true
  useEffect(() => {
    if (!isLive || !currentUser) {
        setMyPosition(null);
        return;
    }

    if (!navigator.geolocation) {
        addToast("Geolocation is not supported by this browser.", "error");
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    addToast("Locating you...", "info");

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newLat = latitude;
            const newLng = longitude;

            setMyPosition({ lat: newLat, lng: newLng });
            
            // Broadcast this new position
            Backend.API.updateLocation(eventId, currentUser, newLat, newLng);
        },
        (error) => {
            console.error("Error getting location:", error);
            addToast(`Location Error: ${error.message}`, "error");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLive, currentUser, eventId]);


  // Custom Icon for Users
  const createAvatarIcon = (url: string) =>
    L.divIcon({
      className: "custom-avatar-icon",
      html: `<div style="background-image: url('${url}'); width: 40px; height: 40px; background-size: cover; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden relative z-0">
      <MapContainer
        center={[eventLat, eventLng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/attr-guide.html">Google Maps</a>'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />
        
        <MapRecenter 
          lat={isLive && myPosition ? myPosition.lat : eventLat} 
          lng={isLive && myPosition ? myPosition.lng : eventLng} 
        />

        {/* Event Marker */}
        <Marker position={[eventLat, eventLng]}>
          <Popup>Event Location</Popup>
        </Marker>

        {/* Peer Markers */}
        {Object.values(peers).map((peer) => (
            <Marker 
                key={peer.userId} 
                position={[peer.lat, peer.lng]}
                icon={createAvatarIcon(peer.avatar)}
            >
                <Popup>{currentUser?.id === peer.userId ? "You" : "Friend"}</Popup>
            </Marker>
        ))}

        {isLive && currentUser && myPosition && (
             <Marker 
             position={[myPosition.lat, myPosition.lng]} 
             icon={createAvatarIcon(currentUser.avatar)}
             opacity={0.9} 
             zIndexOffset={1000}
         >
             <Popup>You (Broadcasting)</Popup>
         </Marker>
        )}

      </MapContainer>
    </div>
  );
};

export default LiveMap;
