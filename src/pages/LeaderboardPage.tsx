import React, { useState, useEffect } from 'react';
import { Award, User, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardUser {
  id: string;
  name: string | null;
  email: string;
  points: number;
  role: 'citizen' | 'moderator' | 'admin';
}

const getRankBadge = (index: number) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}`;
};

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'all_time' | 'weekly'>('all_time');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, points, role')
        .order('points', { ascending: false })
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      // For a real app, this would use a database function to calculate weekly points
      setUsers(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <Award className="h-8 w-8 text-primary-500 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Community Leaderboard</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Top Contributors</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFrame('all_time')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                timeFrame === 'all_time'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFrame('weekly')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                timeFrame === 'weekly'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin h-6 w-6 text-primary-500 mr-3" />
            <span className="text-gray-600">Loading leaderboard...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className={`p-4 flex items-center justify-between ${index < 3 ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 font-bold ${
                    index < 3 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {getRankBadge(index)}
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <span className="font-medium text-gray-800">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      
                      {user.role !== 'citizen' && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-bold">
                  <span className="text-primary-600">{user.points}</span>
                  <span className="text-gray-500 text-sm font-normal ml-1">pts</span>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No users found on the leaderboard.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-primary-50 rounded-lg p-6 border border-primary-100">
        <h3 className="text-lg font-medium text-primary-800 mb-3">How Points Work</h3>
        <div className="text-sm text-primary-700 space-y-2">
          <p><strong>+10 points</strong> - Submitting a new report</p>
          <p><strong>+1 point</strong> - Upvoting a report</p>
          <p><strong>+3 points</strong> - Moderating reports (marking as reviewed/resolved)</p>
          <p>Points help identify active community members and may unlock special features in the future!</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;