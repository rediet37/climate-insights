'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Feature, Geometry } from 'geojson';
import { ethiopiaWoredas, WoredaProperties } from '@/data';

export function WoredaBoundaries() {
  const { selectedGeometry, actions } = useAppStore();
  const map = useMap();

  // Reset map view when woreda selection changes
  useEffect(() => {
    if (!selectedGeometry) {
      // Reset to default view of Ethiopia
      map.setView([9.102, 40.715], 5);
    }
  }, [selectedGeometry, map]);

  // Style for the woreda features
  const getWoredaStyle = (feature: Feature<Geometry, WoredaProperties> | undefined) => {
    if (!feature) return {};
    
    const isSelected = selectedGeometry?.type === 'woreda' && 
                      selectedGeometry.id === feature.properties.shapeID;

    return {
      fillColor: isSelected ? '#transparent' : 'transparent',
      weight: isSelected ? 3 : 0.5,
      opacity: 1,
      color: isSelected ? '#388E3C' : '#999999',
      fillOpacity: isSelected ? 0 : 0,
    };
  };

  // Handle click on a woreda
  const onEachFeature = (feature: Feature<Geometry, WoredaProperties>, layer: L.Layer) => {
    // Add tooltip with woreda name
    if (feature.properties && feature.properties.shapeName) {
      layer.bindTooltip(feature.properties.shapeName, {
        permanent: false,
        direction: 'center',
        className: 'region-tooltip'
      });
    }

    // Add click event handler
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        // Don't select woredas when in drawing mode
        if (useAppStore.getState().isDrawingMode) {
          return;
        }
        
        L.DomEvent.stopPropagation(e);
        const woredaId = feature.properties.shapeID;
        
        // Toggle woreda selection
        const isCurrentlySelected = selectedGeometry?.type === 'woreda' && 
                                   selectedGeometry.id === woredaId;
        
        if (isCurrentlySelected) {
          actions.setSelectedGeometry(null);
        } else {
          const geometry = {
            type: 'woreda' as const,
            id: woredaId,
            name: feature.properties.shapeName,
            geometry: feature.geometry
          };

          actions.setRegionFirstSelection(geometry);

          // small popup with Analyse action
          const popupHtml = `
            <div class="min-w-[160px] px-2 py-2">
              <div class="flex items-center gap-1.5 font-bold text-[18px] leading-tight text-slate-800 mb-3">
                <span class="text-2xl">📍</span>
                <span>${feature.properties.shapeName}</span>
              </div>
              <div class="flex justify-center pb-1.5">
                <button 
                  id="woreda-analyse-btn" 
                  class="appearance-none border-0 rounded-lg px-5 py-2 font-semibold text-[14px] text-white cursor-pointer transition-all duration-150 ease-out inline-flex items-center gap-1 relative overflow-hidden bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0.5" 
                  aria-label="Analyse ${feature.properties.shapeName} woreda">
                  <span>Analyse</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
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
              const btn = document.getElementById('woreda-analyse-btn');
              if (btn) {
                btn.onclick = () => {
                  // Close popup, nudge sidebar
                  map.closePopup(popup);
                  actions.nudgeSidebar();
                };
              }
            }, 0);
          }
          
          // zoom to bounds of the selected woreda
          if (layer instanceof L.Polygon) {
            map.fitBounds(layer.getBounds());
          }
        }
      },
      // Optional: add mouseover and mouseout events for hover effects
      mouseover: (e: L.LeafletMouseEvent) => {
        if (useAppStore.getState().isDrawingMode) {
          const anyLayer = e.target as unknown as { closeTooltip?: () => void };
          anyLayer.closeTooltip?.();
          return;
        }
        const layer = e.target as unknown as L.Path;
        const isSelected = selectedGeometry?.type === 'woreda' && 
                          selectedGeometry.id === feature.properties.shapeID;
                          
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.2,
            fillColor: '#90CAF9'
          });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        if (useAppStore.getState().isDrawingMode) return;
        const layer = e.target as unknown as L.Path;
        const isSelected = selectedGeometry?.type === 'woreda' && 
                          selectedGeometry.id === feature.properties.shapeID;
                          
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
      data={ethiopiaWoredas} 
      style={getWoredaStyle}
      onEachFeature={onEachFeature}
    />
  );
}
