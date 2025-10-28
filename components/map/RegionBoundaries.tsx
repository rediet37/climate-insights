'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Feature, Geometry } from 'geojson';
import ethiopiaRegions, { RegionProperties } from '@/data';

export function RegionBoundaries() {
  const { selectedGeometry, actions } = useAppStore();
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
        if (useAppStore.getState().isDrawingMode) {
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
            <div class="min-w-[160px] px-2 py-2">
              <div class="flex items-center gap-1.5 font-bold text-[18px] leading-tight text-slate-800 mb-3">
                <span class="text-2xl">📍</span>
                <span>${feature.properties.name}</span>
              </div>
              <div class="flex justify-center pb-1.5">
                <button 
                  id="region-analyse-btn" 
                  class="appearance-none border-0 rounded-lg px-5 py-2 font-semibold text-[14px] text-white cursor-pointer transition-all duration-150 ease-out inline-flex items-center gap-1 relative overflow-hidden bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0.5" 
                  aria-label="Analyse ${feature.properties.name} region">
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
        if (useAppStore.getState().isDrawingMode) {
          const anyLayer = e.target as unknown as { closeTooltip?: () => void };
          anyLayer.closeTooltip?.();
          return;
        }
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
        if (useAppStore.getState().isDrawingMode) return;
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
