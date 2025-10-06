'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore, SelectedGeometry } from '@/hooks/useAppStore';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

export function DrawControl() {
  const { isDrawingMode, selectedGeometry, actions } = useAppStore();
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const polygonDrawHandlerRef = useRef<any>(null);

  // One-time initialization of feature group, control, and event handlers
  useEffect(() => {
    // Feature group to store drawn layers
    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    // Draw control
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
        remove: true as any,
        edit: {
          selectedPathOptions: {
            fill: true,
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
          }
        } as any
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Event: created
  const onCreated = (event: any) => {
      const layer = event.layer;

      if (layer.setStyle) {
        layer.setStyle({
          color: '#4CAF50',
          weight: 3,
          opacity: 1,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
        });
      }

      // Only one drawing at a time
      drawnItemsRef.current!.clearLayers();
      drawnItemsRef.current!.addLayer(layer);

      const geometry = layer.toGeoJSON().geometry;
      const newGeometry: SelectedGeometry = {
        type: 'custom',
        name: 'Custom Area',
        geometry,
      };

      // Region-first behavior: reset analysis and set geometry
      actions.setRegionFirstSelection(newGeometry);
      actions.setDrawingMode(false);

      // Popup with Analyse button at polygon center
      try {
        const center = (layer.getBounds && layer.getBounds().getCenter()) || map.getCenter();
        const popupHtml = `
          <div style="min-width:80px">
            <div style="font-weight:600;margin-bottom:6px;">Custom Area</div>
            <button id="custom-analyse-btn" style="background:green;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">Analyse</button>
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

    // Event: edited
    const onEdited = (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        const geometry = layer.toGeoJSON().geometry;
        const updatedGeometry: SelectedGeometry = {
          type: 'custom',
          name: 'Custom Area (Edited)',
          geometry,
        };
        actions.setSelectedGeometry(updatedGeometry);
      });
    };

    // Event: deleted
    const onDeleted = () => {
      actions.setSelectedGeometry(null);
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    // Cleanup only on unmount
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
    };
  }, [map, actions]);

  // Enable polygon drawing when isDrawingMode is true
  useEffect(() => {
    if (!isDrawingMode || !drawControlRef.current) return;

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

    // Start polygon drawing programmatically with the control's options
    const polygonOptions = (drawControlRef.current as any).options.draw.polygon;
    polygonDrawHandlerRef.current = new (L.Draw as any).Polygon(map, polygonOptions);
    polygonDrawHandlerRef.current.enable();
  }, [isDrawingMode, map, actions, selectedGeometry]);

  // Update the drawn items when selectedGeometry changes
  useEffect(() => {
    if (!drawnItemsRef.current) return;
    // Keep the current drawing on the map when selection updates
    drawnItemsRef.current.clearLayers();

    if (selectedGeometry && selectedGeometry.type === 'custom') {
      const geoJSON = {
        type: 'Feature',
        properties: {},
        geometry: selectedGeometry.geometry,
      } as any;

      const layer = L.geoJSON(geoJSON, {
        style: {
          color: '#4CAF50',
          weight: 3,
          opacity: 1,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
        }
      });

      layer.eachLayer((l: any) => {
        if (l.setStyle) {
          l.setStyle({
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

  return null; // This component doesn't render anything directly
}
