import React, { useState } from 'react';
import ReportCard from './ReportCard';
import { Filter } from 'lucide-react';

interface Report {
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
}

interface ReportListProps {
  reports: Report[];
  onVote: (reportId: string) => Promise<void>;
  onStatusChange?: (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => Promise<void>;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onVote, onStatusChange }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Get unique categories
  const categories = ['all', ...new Set(reports.map(report => report.category || 'uncategorized'))];
  
  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || 
                           (report.category === null && categoryFilter === 'uncategorized') ||
                           report.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === 'most_votes') {
      return b.votes_count - a.votes_count;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium">Filter Reports</h3>
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
              className="w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white text-gray-700 text-sm"
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
              className="w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white text-gray-700 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' 
                    ? 'All Categories' 
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white text-gray-700 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_votes">Most Votes</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedReports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No reports match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReports.map(report => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onVote={onVote}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;