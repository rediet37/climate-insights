'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore, SelectedGeometry } from '@/hooks/useAppStore';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

/**
 * Leaflet Draw integration for the Climate map.
 *
 * Responsibilities:
 * - Mount a FeatureGroup to hold drawn shapes
 * - Configure the Leaflet.Draw toolbar (polygon/rectangle; no markers/lines)
 * - Translate user drawings into our app store's SelectedGeometry
 * - Keep only one active drawing at a time and wire up edit/delete events
 */
export function DrawControl() {
  const { isDrawingMode, selectedGeometry, actions } = useAppStore();
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const polygonDrawHandlerRef = useRef<{ enable: () => void; disable: () => void } | null>(null);
  const toolbarDrawingRef = useRef(false);

  // Mount-time: create draw layer, control, and event handlers
  useEffect(() => {
    // Feature group to store drawn layers (used by edit/delete control)
    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    // Configure draw control (only polygon/rectangle enabled)
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        circle: false,
        circlemarker: false,
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: '#4CAF50',
            weight: 3,
            opacity: 1,
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
          }
        },
        polygon: {
          allowIntersection: false,
          showArea: true,
          repeatMode: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#4CAF50',
            weight: 3,
            opacity: 1,
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
          }
        }
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
        edit: {
          selectedPathOptions: {
            fill: true,
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
          }
        }
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    const onDrawStart = (e: unknown) => {
      const layerType = (e as { layerType?: string }).layerType;
      if (layerType === 'rectangle' || layerType === 'polygon') {
        toolbarDrawingRef.current = true;
        actions.setDrawingMode(true);
      }
    };
    const onDrawStop = () => {
      toolbarDrawingRef.current = false;
      actions.setDrawingMode(false);
    };

    // Event: created — persist the new layer and push geometry into the store
    const onCreated = (event: unknown) => {
      const layer = (event as { layer: L.Layer }).layer;

      if ((layer as L.Path).setStyle) {
        (layer as L.Path).setStyle({
          color: '#4CAF50',
          weight: 3,
          opacity: 1,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
        });
      }

      // Only one drawing at a time (clear previous shapes)
      drawnItemsRef.current!.clearLayers();
      drawnItemsRef.current!.addLayer(layer);

      // Zoom to the bounds of the newly drawn shape (polygon or rectangle)
      try {
        const bounds = (layer as unknown as { getBounds?: () => L.LatLngBounds }).getBounds?.();
        if (bounds) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch {}

      const geometry = (layer as L.Polygon).toGeoJSON().geometry as GeoJSON.Geometry;
      const newGeometry: SelectedGeometry = {
        type: 'custom',
        name: 'Custom Area',
        geometry,
      };

  // Region-first behavior: reset analysis and set geometry
      actions.setRegionFirstSelection(newGeometry);
      actions.setDrawingMode(false);

      // Show an "Analyse" popup anchored at the geometry center
      try {
        const center = ((layer as unknown as { getBounds?: () => L.LatLngBounds }).getBounds?.() &&
          (layer as unknown as { getBounds: () => L.LatLngBounds }).getBounds().getCenter()) || map.getCenter();
        const popupHtml = `
          <div class="min-w-[160px] px-2 py-2">
            <div class="flex items-center gap-1.5 font-bold text-[18px] leading-tight text-slate-800 mb-3">
              <span class="text-2xl">📍</span>
              <span>Custom Area</span>
            </div>
            <div class="flex justify-center pb-1.5">
              <button 
                id="custom-analyse-btn" 
                class="appearance-none border-0 rounded-lg px-5 py-2 font-semibold text-[14px] text-white cursor-pointer transition-all duration-150 ease-out inline-flex items-center gap-1 relative overflow-hidden bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0.5" 
                aria-label="Analyse custom area">
                <span>Analyse</span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        `;
        const popup = L.popup({ closeOnClick: true })
          .setLatLng(center)
          .setContent(popupHtml)
          .openOn(map);

        setTimeout(() => {
          const btn = document.getElementById('custom-analyse-btn');
          if (btn) {
            btn.onclick = () => {
              map.closePopup(popup);
              actions.nudgeSidebar();
            };
          }
        }, 0);
    } catch {}

      if (polygonDrawHandlerRef.current) {
        polygonDrawHandlerRef.current.disable();
        polygonDrawHandlerRef.current = null;
      }

      drawnItemsRef.current!.bringToFront();
      setTimeout(() => map.invalidateSize(), 50);
    };

    const onEdited = (event: unknown) => {
      const layers = (event as { layers: L.FeatureGroup }).layers;
      let combinedBounds: L.LatLngBounds | null = null;
      layers.eachLayer((layer: L.Layer) => {
        const geometry = (layer as L.Polygon).toGeoJSON().geometry as GeoJSON.Geometry;
        const updatedGeometry: SelectedGeometry = {
          type: 'custom',
          name: 'Custom Area (Edited)',
          geometry,
        };
        actions.setSelectedGeometry(updatedGeometry);

        // Grow combined bounds for all edited layers
        const b = (layer as unknown as { getBounds?: () => L.LatLngBounds }).getBounds?.();
        if (b) {
          combinedBounds = combinedBounds ? combinedBounds.extend(b) : b;
        }
      });

      // Zoom to the edited shape(s)
      if (combinedBounds) {
        map.fitBounds(combinedBounds, { padding: [20, 20] });
      }
    };

    // Event: deleted — clear selection in store
    const onDeleted = () => {
      actions.setSelectedGeometry(null);
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);
  map.on(L.Draw.Event.DRAWSTART, onDrawStart);
  map.on(L.Draw.Event.DRAWSTOP, onDrawStop);

  // Cleanup only on unmount: detach events and controls
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.off(L.Draw.Event.DRAWSTART, onDrawStart);
      map.off(L.Draw.Event.DRAWSTOP, onDrawStop);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
    };
  }, [map, actions]);

  // When isDrawingMode is toggled on, start a fresh polygon drawing session
  useEffect(() => {
    if (!isDrawingMode || !drawControlRef.current) return;
    if (toolbarDrawingRef.current) return;

    // Clear previous handler
    if (polygonDrawHandlerRef.current) {
      polygonDrawHandlerRef.current.disable();
      polygonDrawHandlerRef.current = null;
    }

    // Clear any existing drawing and selection when starting a new drawing
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    if (selectedGeometry) {
      actions.setSelectedGeometry(null);
    }

  // Start polygon drawing programmatically using the control's polygon options
  const polygonOptions = (drawControlRef.current as unknown as { options: { draw: { polygon: unknown } } }).options.draw.polygon;
  const DrawPolygon = (L as unknown as { Draw: { Polygon: new (map: L.Map, options?: unknown) => { enable: () => void; disable: () => void } } }).Draw.Polygon;
  polygonDrawHandlerRef.current = new DrawPolygon(map, polygonOptions);
  polygonDrawHandlerRef.current.enable();
  }, [isDrawingMode, map, actions, selectedGeometry]);

  // Update the drawn items when selectedGeometry changes
  useEffect(() => {
    if (!drawnItemsRef.current) return;
    // Keep the current drawing on the map when selection updates
    drawnItemsRef.current.clearLayers();

    if (selectedGeometry && selectedGeometry.type === 'custom') {
      const geoJSON: GeoJSON.Feature<GeoJSON.Geometry> = {
        type: 'Feature',
        properties: {},
        geometry: selectedGeometry.geometry,
      };

      const layer = L.geoJSON(geoJSON, {
        style: {
          color: '#4CAF50',
          weight: 3,
          opacity: 1,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
        }
      });

      layer.eachLayer((l: L.Layer) => {
        if ((l as L.Path).setStyle) {
          (l as L.Path).setStyle({
            color: '#4CAF50',
            weight: 3,
            opacity: 1,
            fillColor: 'transparent'
          });
        }
        drawnItemsRef.current!.addLayer(l);
      });

      drawnItemsRef.current.bringToFront();
    }
  }, [selectedGeometry]);

  // This control is purely imperative; nothing to render
  return null;
}
