"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPreviewProps {
  lat: number
  lng: number
  address?: string
  zoom?: number
  height?: string
}

// Component to update map view when coordinates change
function MapController({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], zoom)
  }, [map, lat, lng, zoom])

  return null
}

export default function MapPreview({
  lat,
  lng,
  address,
  zoom = 13,
  height = "300px"
}: MapPreviewProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Custom marker icon for better visibility
  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return (
    <div style={{ height }} className="w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* Base tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Satellite view layer (optional - can be toggled) */}
        {/* <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        /> */}

        {/* Map controller to update view */}
        <MapController lat={lat} lng={lng} zoom={zoom} />

        {/* Location marker */}
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>
            <div className="space-y-2">
              <div className="font-medium">
                {address || 'Detected Location'}
              </div>
              <div className="text-sm text-gray-600 font-mono">
                Lat: {lat.toFixed(6)}<br />
                Lng: {lng.toFixed(6)}
              </div>
              <div className="text-xs text-gray-500">
                Click and drag to explore the area
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
