import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowUp, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ReportCardProps {
  report: {
    id: string;
    category: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    clean_text: string | null;
    raw_text: string;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    image_url: string | null;
    votes_count: number;
    user_has_voted: boolean;
  };
  onVote: (reportId: string) => Promise<void>;
  onStatusChange?: (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => Promise<void>;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onVote, onStatusChange }) => {
  const { user, isModerator } = useAuth();
  
  const formattedDate = new Date(report.created_at).toLocaleDateString();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success-100 text-success-700';
      case 'reviewed':
        return 'bg-warning-100 text-warning-700';
      case 'pending':
      default:
        return 'bg-danger-100 text-danger-700';
    }
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      await onVote(report.id);
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      await onStatusChange(report.id, newStatus);
    }
  };

  return (
    <Link to={`/reports/${report.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        {report.image_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={report.image_url} 
              alt={report.category || 'Issue'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                {report.category || 'Uncategorized'}
              </span>
              <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
            
            <button
              onClick={handleVote}
              disabled={!user || report.user_has_voted}
              className={`flex items-center space-x-1 px-2 py-1 rounded ${
                report.user_has_voted
                  ? 'bg-primary-100 text-primary-700'
                  : user 
                    ? 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="h-4 w-4" />
              <span>{report.votes_count}</span>
            </button>
          </div>
          
          <p className="mt-3 text-gray-800 line-clamp-3">
            {report.clean_text || report.raw_text}
          </p>
          
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {report.latitude && report.longitude && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Map location available</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
            
            {isModerator() && onStatusChange && report.status !== 'resolved' && (
              <button
                onClick={(e) => handleStatusChange(e, 'resolved')}
                className="flex items-center space-x-1 text-success-600 hover:text-success-700"
              >
                <Check className="h-4 w-4" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReportCard;