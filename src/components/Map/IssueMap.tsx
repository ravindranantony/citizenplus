import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report } from '../../types/reports';

interface IssueMapProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
}

function MapController({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = reports
        .filter(report => report.latitude && report.longitude)
        .map(report => [report.latitude!, report.longitude!] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [reports, map]);

  return null;
}

const IssueMap: React.FC<IssueMapProps> = ({ 
  reports, 
  center = [20, 0], 
  zoom = 2 
}) => {
  const createMarkerIcon = (status: string) => {
    const color = status === 'resolved' ? 'bg-success-500' : 
                status === 'reviewed' ? 'bg-warning-500' : 'bg-danger-500';
    
    return divIcon({
      html: `
        <div class="${color} w-6 h-6 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController reports={reports} />
        
        {reports.map(report => {
          if (report.latitude && report.longitude) {
            return (
              <Marker 
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createMarkerIcon(report.status)}
              >
                <Popup className="rounded-lg overflow-hidden">
                  <div className="max-w-xs">
                    {report.image_url && (
                      <img 
                        src={report.image_url} 
                        alt={report.category || 'Issue'} 
                        className="w-full h-32 object-cover mb-2 rounded-t-lg -mt-2 -mx-2"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                          {report.category || 'Uncategorized'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'resolved' 
                            ? 'bg-success-100 text-success-700'
                            : report.status === 'reviewed'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-danger-100 text-danger-700'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium line-clamp-3">
                        {report.clean_text || report.raw_text}
                      </p>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <Link 
                          to={`/reports/${report.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default IssueMap;