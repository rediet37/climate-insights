'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Feature, Geometry } from 'geojson';
import ethiopiaRegions, { RegionProperties } from '@/data';

export function RegionBoundaries() {
  const { selectedGeometry, isDrawingMode, actions } = useAppStore();
  const map = useMap();

  // Reset map view when region selection changes
  useEffect(() => {
    if (!selectedGeometry) {
      // Reset to default view of Ethiopia
      map.setView([9.102, 40.715], 5);
    }
  }, [selectedGeometry, map]);

  // Style for the region features
  const getRegionStyle = (feature: Feature<Geometry, RegionProperties> | undefined) => {
    if (!feature) return {};
    
    const isSelected = selectedGeometry?.type === 'region' && 
                      selectedGeometry.id === feature.properties.id;

    return {
      fillColor: isSelected ? '#transparent' : 'transparent',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#388E3C' : '#777777',
      fillOpacity: isSelected ? 0 : 0,
    };
  };

  // Handle click on a region
  const onEachFeature = (feature: Feature<Geometry, RegionProperties>, layer: L.Layer) => {
    // Add tooltip with region name
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, {
        permanent: false,
        direction: 'center',
        className: 'region-tooltip'
      });
    }

    // Add click event handler
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        // Don't select regions when in drawing mode
        if (isDrawingMode) {
          return;
        }
        
        L.DomEvent.stopPropagation(e);
        const regionId = feature.properties.id;
        
        // Toggle region selection
        const isCurrentlySelected = selectedGeometry?.type === 'region' && 
                                   selectedGeometry.id === regionId;
        
        if (isCurrentlySelected) {
          actions.setSelectedGeometry(null);
        } else {
          const geometry = {
            type: 'region' as const,
            id: regionId,
            name: feature.properties.name,
            geometry: feature.geometry
          };

          actions.setRegionFirstSelection(geometry);

          // small popup with Analyse action
          const popupHtml = `
            <div style="min-width:80px">
              <div style="font-weight:600;margin-bottom:6px;">${feature.properties.name} Region</div>
              <button id="region-analyse-btn" style="display:block;background:green;color:white;border:none;margin-left:auto;margin-right:auto;padding:8px 10px;border-radius:6px;cursor:pointer;">Analyse</button>
            </div>
          `;

          const latlng = e.latlng || ((layer as unknown as { getBounds?: () => L.LatLngBounds }).getBounds?.().getCenter?.());
          if (latlng) {
            const popup = L.popup({ closeOnClick: true })
              .setLatLng(latlng)
              .setContent(popupHtml)
              .openOn(map);

            // Wire button after popup opens
            setTimeout(() => {
              const btn = document.getElementById('region-analyse-btn');
              if (btn) {
                btn.onclick = () => {
                  // Close popup, nudge sidebar
                  map.closePopup(popup);
                  actions.nudgeSidebar();
                };
              }
            }, 0);
          }
          
          // zoom to bounds of the selected region
          if (layer instanceof L.Polygon) {
            map.fitBounds(layer.getBounds());
          }
        }
      },
      // Optional: add mouseover and mouseout events for hover effects
      mouseover: (e: L.LeafletMouseEvent) => {
        const layer = e.target as unknown as L.Path;
        const isSelected = selectedGeometry?.type === 'region' && 
                          selectedGeometry.id === feature.properties.id;
                          
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.2,
            fillColor: '#90CAF9'
          });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const layer = e.target as unknown as L.Path;
        const isSelected = selectedGeometry?.type === 'region' && 
                          selectedGeometry.id === feature.properties.id;
                          
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0,
            fillColor: 'transparent'
          });
        }
      }
    });
  };

  return (
    <GeoJSON 
      data={ethiopiaRegions} 
      style={getRegionStyle}
      onEachFeature={onEachFeature}
    />
  );
}
