import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PlusCircle, Loader, List, Map as MapIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import IssueMap from '../components/Map/IssueMap';
import ReportList from '../components/Reports/ReportList';
import { mockReports } from '../data/mockReports';

const HomePage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // In development, use mock data
      if (import.meta.env.DEV) {
        setReports(mockReports);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          votes:votes(count),
          voted_by_user:votes!inner(user_id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      const transformedData = data.map(report => {
        const votesCount = report.votes[0]?.count || 0;
        const userHasVoted = user 
          ? report.voted_by_user.some((vote: any) => vote.user_id === user.id)
          : false;
          
        return {
          ...report,
          votes_count: votesCount,
          user_has_voted: userHasVoted,
          voted_by_user: undefined,
          votes: undefined,
        };
      });
      
      setReports(transformedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId: string) => {
    if (!user) return;
    
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Optimistically update UI
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, votes_count: r.votes_count + 1, user_has_voted: true }
          : r
      ));

      // In development, don't make the API call
      if (import.meta.env.DEV) return;

      const { error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          report_id: reportId
        });
        
      if (error) {
        throw error;
      }
      
      await supabase.rpc('increment_user_points', { user_id: user.id, points_to_add: 1 });
    } catch (error) {
      console.error('Error voting for report:', error);
      // Revert optimistic update on error
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, votes_count: r.votes_count - 1, user_has_voted: false }
          : r
      ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Community Issues
          </h1>
          <p className="text-gray-600">
            Discover and report civic issues in your area
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setView('map')}
              className={`flex items-center px-4 py-2 rounded-md transition ${
                view === 'map'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center px-4 py-2 rounded-md transition ${
                view === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </button>
          </div>
          
          {user && (
            <Link
              to="/submit"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin h-6 w-6 text-primary-500 mr-3" />
            <span className="text-gray-600">Loading reports...</span>
          </div>
        ) : reports.length > 0 ? (
          view === 'map' ? (
            <IssueMap reports={reports} />
          ) : (
            <ReportList reports={reports} onVote={handleVote} />
          )
        ) : (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No civic issues reported yet.</p>
            {user ? (
              <Link
                to="/submit"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Report an Issue</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
              >
                <span>Sign in to Report an Issue</span>
              </Link>
            )}
          </div>
        )}
      </div>
      
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-primary-600">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Resolved Issues</h3>
            <p className="text-3xl font-bold text-success-600">
              {reports.filter(r => r.status === 'resolved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-warning-600">
              {reports.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;