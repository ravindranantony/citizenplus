import React, { useState, useEffect } from 'react';
import { 
  Loader, 
  FileText, 
  Filter, 
  User, 
  Search,
  CheckSquare, 
  XSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  raw_text: string;
  clean_text: string | null;
  category: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  user: {
    name: string | null;
    email: string;
  };
  votes_count: number;
}

const AdminPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    
    fetchReports();
  }, [statusFilter, categoryFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reports')
        .select(`
          id, 
          raw_text, 
          clean_text, 
          category, 
          status, 
          created_at,
          user:users!inner(name, email),
          votes(count)
        `)
        .order('created_at', { ascending: false });
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'uncategorized') {
          query = query.is('category', null);
        } else {
          query = query.eq('category', categoryFilter);
        }
      }
      
      if (searchTerm) {
        query = query.or(`raw_text.ilike.%${searchTerm}%,clean_text.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      // Transform data to include vote count
      const transformedData = data.map(report => ({
        ...report,
        votes_count: report.votes[0]?.count || 0,
        votes: undefined, // Remove this to clean up the object
      }));
      
      setReports(transformedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus } 
          : report
      ));
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  // Get unique categories
  const categories = ['all', 'uncategorized', ...new Set(reports
    .filter(report => report.category)
    .map(report => report.category as string))];

  const getStatusBadgeClass = (status: string) => {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-primary-500 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">Filter and Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-gray-700 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-gray-700 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' 
                      ? 'All Categories' 
                      : category === 'uncategorized'
                        ? 'Uncategorized'
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 pl-10 pr-3 bg-white text-gray-700 text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin h-6 w-6 text-primary-500 mr-3" />
              <span className="text-gray-600">Loading reports...</span>
            </div>
          ) : reports.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="line-clamp-2 max-w-xs">
                        {report.clean_text || report.raw_text}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{report.user?.name || report.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.category ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                          {report.category}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.votes_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        {report.status !== 'resolved' && (
                          <button
                            onClick={() => handleStatusChange(report.id, 'resolved')}
                            className="text-success-600 hover:text-success-800"
                            title="Mark as Resolved"
                          >
                            <CheckSquare className="h-5 w-5" />
                          </button>
                        )}
                        {report.status !== 'reviewed' && report.status !== 'resolved' && (
                          <button
                            onClick={() => handleStatusChange(report.id, 'reviewed')}
                            className="text-warning-600 hover:text-warning-800"
                            title="Mark as Reviewed"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                        )}
                        {report.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(report.id, 'pending')}
                            className="text-gray-500 hover:text-gray-700"
                            title="Mark as Pending"
                          >
                            <XSquare className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No reports match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;