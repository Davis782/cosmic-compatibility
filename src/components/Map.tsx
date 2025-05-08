
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Event } from '@/lib/db';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MapProps {
  events: Event[];
}

const Map: React.FC<MapProps> = ({ events }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenEntered, setTokenEntered] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't try to initialize map if no token is provided
    if (!mapboxToken || !tokenEntered) return;
    if (!mapContainer.current) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.935242, 40.730610], // New York coordinates
        zoom: 12
      });

      // Add markers for each event
      events.forEach(event => {
        console.log('Adding marker for event:', event);
        try {
          new mapboxgl.Marker()
            .setLngLat(event.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <h3 class="font-bold">${event.title}</h3>
              <p>${event.location}</p>
            `))
            .addTo(map.current!);
        } catch (markerError) {
          console.error("Error adding marker:", markerError);
        }
      });

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (mapError) {
      console.error("Error initializing map:", mapError);
      setError("Failed to initialize map. Please check your Mapbox token.");
    }
  }, [mapboxToken, tokenEntered, events]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenEntered(true);
  };

  if (!tokenEntered) {
    return (
      <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium">Mapbox Setup Required</h3>
        <p className="text-sm text-gray-600">
          To display maps, please enter your Mapbox access token. 
          You can get a free token from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>.
        </p>
        <form onSubmit={handleTokenSubmit} className="space-y-3">
          <div>
            <Label htmlFor="mapbox-token">Mapbox Token</Label>
            <Input 
              id="mapbox-token" 
              value={mapboxToken} 
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="Enter your Mapbox token" 
              required
            />
          </div>
          <Button type="submit">Save Token</Button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => {
            setTokenEntered(false);
            setError(null);
          }}
        >
          Try Different Token
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map;
