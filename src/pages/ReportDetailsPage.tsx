import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  ArrowUp, 
  ArrowLeft, 
  User, 
  Check, 
  Loader,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import IssueMap from '../components/Map/IssueMap';

const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id, user]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          users:user_id(name, email),
          votes(count),
          votes_by_user:votes!inner(user_id)
        `)
        .eq('id', reportId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        setError('Report not found');
        return;
      }
      
      setReport(data);
      setVotesCount(data.votes?.[0]?.count || 0);
      
      if (user) {
        const userVoted = data.votes_by_user.some((vote: any) => vote.user_id === user.id);
        setUserHasVoted(userVoted);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user || !id || userHasVoted) return;
    
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          report_id: id
        });
        
      if (error) {
        throw error;
      }
      
      // Award points to user
      await supabase.rpc('increment_user_points', { user_id: user.id, points_to_add: 1 });
      
      setUserHasVoted(true);
      setVotesCount(prev => prev + 1);
    } catch (error) {
      console.error('Error voting for report:', error);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'reviewed' | 'resolved') => {
    if (!user || !id || !isModerator()) return;
    
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Award points to the moderator
      await supabase.rpc('increment_user_points', { user_id: user.id, points_to_add: 3 });
      
      // Refresh the report data
      fetchReport(id);
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-6 w-6 text-primary-500 mr-3" />
        <span className="text-gray-600">Loading report details...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The report you are looking for does not exist.'}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(report.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to all reports</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {report.image_url && (
          <div className="h-64 md:h-80 overflow-hidden">
            <img 
              src={report.image_url} 
              alt={report.category || 'Issue'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div className="mb-2 md:mb-0">
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700 mr-2">
                {report.category || 'Uncategorized'}
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
            
            <button
              onClick={handleVote}
              disabled={!user || userHasVoted}
              className={`flex items-center space-x-1 px-3 py-1 rounded ${
                userHasVoted
                  ? 'bg-primary-100 text-primary-700'
                  : user 
                    ? 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="h-5 w-5" />
              <span className="font-medium">{votesCount}</span>
            </button>
          </div>
          
          <div className="mb-6">
            {report.clean_text && report.clean_text !== report.raw_text && (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-2">AI Enhanced Description</h3>
                <p className="text-gray-800 mb-4">{report.clean_text}</p>
                
                <h4 className="text-sm font-medium text-gray-600 mb-1">Original Report</h4>
                <p className="text-gray-600 text-sm italic bg-gray-50 p-3 rounded-md">{report.raw_text}</p>
              </>
            )}
            
            {(!report.clean_text || report.clean_text === report.raw_text) && (
              <>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-gray-800">{report.raw_text}</p>
              </>
            )}
          </div>
          
          {report.latitude && report.longitude && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Location</h3>
              <div className="h-64">
                <IssueMap 
                  reports={[report]} 
                  center={[report.latitude, report.longitude]} 
                  zoom={15}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Reported by {report.users?.name || 'Anonymous'}</span>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {isModerator() && report.status !== 'resolved' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Moderator Actions</h3>
              <div className="flex space-x-3">
                {report.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange('reviewed')}
                    className="px-4 py-2 bg-warning-100 text-warning-700 font-medium rounded-md hover:bg-warning-200 transition"
                  >
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('resolved')}
                  className="px-4 py-2 bg-success-100 text-success-700 font-medium rounded-md hover:bg-success-200 transition"
                >
                  <Check className="h-4 w-4 inline mr-1" />
                  Mark as Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;