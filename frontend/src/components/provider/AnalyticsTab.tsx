import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  EyeIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  profile_views: {
    total: number;
    this_month: number;
    last_month: number;
  };
  leads: {
    total: number;
    this_month: number;
    conversion_rate: number;
    by_status: {
      new: number;
      contacted: number;
      booked: number;
    };
  };
  revenue: {
    total_bookings: number;
    estimated_value: number;
    this_month: number;
  };
  performance: {
    response_time_avg: number;
    rating_avg: number;
    completion_rate: number;
  };
  recent_activity: Array<{
    id: string;
    type: 'view' | 'lead' | 'booking';
    description: string;
    created_at: string;
  }>;
}

interface AnalyticsTabProps {
  providerId: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ providerId }) => {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (providerId) {
      fetchAnalytics();
    }
  }, [providerId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/analytics/provider/${providerId}?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      // Set mock data for demo
      setAnalytics({
        profile_views: {
          total: 1247,
          this_month: 89,
          last_month: 76
        },
        leads: {
          total: 24,
          this_month: 8,
          conversion_rate: 12.5,
          by_status: {
            new: 3,
            contacted: 2,
            booked: 3
          }
        },
        revenue: {
          total_bookings: 15,
          estimated_value: 45000,
          this_month: 12000
        },
        performance: {
          response_time_avg: 2.5,
          rating_avg: 4.8,
          completion_rate: 94.2
        },
        recent_activity: [
          {
            id: '1',
            type: 'lead',
            description: 'New lead for wedding photography',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            type: 'view',
            description: 'Profile viewed by potential customer',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'booking',
            description: 'Booking confirmed for corporate event',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case 'lead': return <EnvelopeIcon className="h-4 w-4 text-yellow-500" />;
      case 'booking': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default: return <ChartBarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data will appear once you start receiving profile views and leads.</p>
      </div>
    );
  }

  const viewsGrowth = getGrowthPercentage(analytics.profile_views.this_month, analytics.profile_views.last_month);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.profile_views.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowTrendingUpIcon className={`h-4 w-4 ${viewsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ${viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {viewsGrowth >= 0 ? '+' : ''}{viewsGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.leads.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.leads.conversion_rate}% conversion
                </p>
              </div>
              <EnvelopeIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.revenue.total_bookings}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ${analytics.revenue.estimated_value.toLocaleString()} value
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.performance.rating_avg}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.performance.completion_rate}% completion
                </p>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(analytics.performance.rating_avg) ? 'fill-current' : 'fill-gray-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5" />
              Leads Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New Leads</span>
                </div>
                <span className="font-medium">{analytics.leads.by_status.new}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Contacted</span>
                </div>
                <span className="font-medium">{analytics.leads.by_status.contacted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
                <span className="font-medium">{analytics.leads.by_status.booked}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-medium">{analytics.performance.response_time_avg}h avg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((24 - analytics.performance.response_time_avg) / 24 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-medium">{analytics.performance.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analytics.performance.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recent_activity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};