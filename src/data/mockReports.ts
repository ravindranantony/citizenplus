import { Report } from '../types/reports';

export const mockReports: Report[] = [
  {
    id: '1',
    user_id: 'mock-user-1',
    raw_text: 'Large pothole on Main Street causing traffic delays',
    clean_text: 'Deep pothole (approximately 2 feet wide) on Main Street near Central Park intersection causing significant traffic delays and vehicle damage risks.',
    category: 'road',
    status: 'pending',
    latitude: 40.7128,
    longitude: -74.0060,
    image_url: 'https://images.pexels.com/photos/2845464/pexels-photo-2845464.jpeg',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    votes_count: 15,
    user_has_voted: false
  },
  {
    id: '2',
    user_id: 'mock-user-2',
    raw_text: 'Broken street light in Stockholm city center',
    clean_text: 'Street light malfunction at Drottninggatan, creating safety concerns during evening hours.',
    category: 'electricity',
    status: 'reviewed',
    latitude: 59.3293,
    longitude: 18.0686,
    image_url: 'https://images.pexels.com/photos/1755683/pexels-photo-1755683.jpeg',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    votes_count: 8,
    user_has_voted: false
  },
  {
    id: '3',
    user_id: 'mock-user-3',
    raw_text: 'Garbage collection delayed in Mumbai suburb',
    clean_text: 'Uncollected waste in Bandra West area for past 3 days causing sanitation concerns.',
    category: 'sanitation',
    status: 'pending',
    latitude: 19.0760,
    longitude: 72.8777,
    image_url: 'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    votes_count: 25,
    user_has_voted: false
  },
  {
    id: '4',
    user_id: 'mock-user-4',
    raw_text: 'Water supply issues in Cape Town neighborhood',
    clean_text: 'Intermittent water supply in Gardens area affecting multiple residential blocks.',
    category: 'water',
    status: 'resolved',
    latitude: -33.9249,
    longitude: 18.4241,
    image_url: 'https://images.pexels.com/photos/1059892/pexels-photo-1059892.jpeg',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    votes_count: 12,
    user_has_voted: false
  }
];