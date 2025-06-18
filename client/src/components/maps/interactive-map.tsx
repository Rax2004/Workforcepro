import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Briefcase } from "lucide-react";

interface InteractiveMapProps {
  workers?: any[];
  jobs?: any[];
  onLocationClick?: (lat: number, lng: number, address: string) => void;
}

export function InteractiveMap({ workers = [], jobs = [], onLocationClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Mock map implementation with click-to-create functionality
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to mock lat/lng
    const lat = 40.7128 + (y - rect.height / 2) * 0.01;
    const lng = -74.0060 + (x - rect.width / 2) * 0.01;
    
    const address = `${Math.floor(100 + Math.random() * 900)} ${['Main St', 'Oak Ave', 'Broadway', 'Park Blvd'][Math.floor(Math.random() * 4)]}, NYC`;
    
    setSelectedLocation({ lat, lng, address });
    onLocationClick?.(lat, lng, address);
  };

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'working': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const availableWorkers = workers.filter(w => w.status === 'available').length;
  const workingWorkers = workers.filter(w => w.status === 'working').length;

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Legend */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Available Workers ({availableWorkers})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Working ({workingWorkers})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Job Locations ({jobs.length})</span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative">
        <div
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full h-80 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden cursor-crosshair border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors"
        >
          {!mapReady ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Map background pattern */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" className="text-slate-400">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Instructions */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <MapPin className="mx-auto mb-2 text-primary" size={32} />
                  <p className="text-sm font-medium">Click anywhere to create a job</p>
                  <p className="text-xs text-muted-foreground">Interactive job placement</p>
                </div>
              </div>

              {/* Mock worker markers */}
              {workers.slice(0, 5).map((worker, index) => (
                <div
                  key={worker.id}
                  className={`absolute w-3 h-3 ${getWorkerStatusColor(worker.status)} rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform cursor-pointer`}
                  style={{
                    left: `${20 + index * 15 + Math.random() * 10}%`,
                    top: `${30 + index * 10 + Math.random() * 10}%`
                  }}
                  title={`${worker.user?.name} (${worker.status})`}
                />
              ))}

              {/* Mock job location markers */}
              {jobs.slice(0, 3).map((job, index) => (
                <div
                  key={job.id}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform cursor-pointer"
                  style={{
                    left: `${60 + index * 15}%`,
                    top: `${25 + index * 20}%`
                  }}
                  title={job.title}
                />
              ))}

              {/* Selected location marker */}
              {selectedLocation && (
                <div
                  className="absolute w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <Card className="absolute bottom-4 left-4 right-4 p-3 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Selected Location</p>
                <p className="text-xs text-muted-foreground">{selectedLocation.address}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <Button size="sm" onClick={() => setSelectedLocation(null)}>
                Clear
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Users className="text-green-600 dark:text-green-400" size={16} />
            <div>
              <p className="text-sm font-medium">{availableWorkers}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Users className="text-red-600 dark:text-red-400" size={16} />
            <div>
              <p className="text-sm font-medium">{workingWorkers}</p>
              <p className="text-xs text-muted-foreground">Working</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="text-blue-600 dark:text-blue-400" size={16} />
            <div>
              <p className="text-sm font-medium">{jobs.length}</p>
              <p className="text-xs text-muted-foreground">Jobs</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
