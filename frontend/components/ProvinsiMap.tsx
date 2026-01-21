'use client';

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface ProvinsiMapProps {
  geojsonData: any;
}

// Component to fit bounds after GeoJSON is loaded
function FitBounds({ geojsonData }: { geojsonData: any }) {
  const map = useMap();

  useEffect(() => {
    if (geojsonData && geojsonData.features && geojsonData.features.length > 0) {
      const bounds = new LatLngBounds([]);
      geojsonData.features.forEach((feature: any) => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates.forEach((polygon: any) => {
            polygon.forEach((ring: any) => {
              ring.forEach((coord: any) => {
                bounds.extend([coord[1], coord[0]]);
              });
            });
          });
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [geojsonData, map]);

  return null;
}

export default function ProvinsiMap({ geojsonData }: ProvinsiMapProps) {
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const { nama, kode } = feature.properties;
      layer.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${nama}</h3>
          <p class="text-sm text-gray-600">Kode: ${kode}</p>
        </div>
      `);

      // Highlight on hover
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#666',
            fillOpacity: 0.7,
          });
        },
        mouseout: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            color: '#3388ff',
            fillOpacity: 0.5,
          });
        },
      });
    }
  };

  const style = {
    fillColor: '#3388ff',
    weight: 2,
    opacity: 1,
    color: '#3388ff',
    fillOpacity: 0.5,
  };

  return (
    <MapContainer
      center={[-2.5, 118.0]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geojsonData && (
        <>
          <GeoJSON
            data={geojsonData}
            style={style}
            onEachFeature={onEachFeature}
          />
          <FitBounds geojsonData={geojsonData} />
        </>
      )}
    </MapContainer>
  );
}
