import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const analyticsController = {
  getProviderAnalytics: async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;
      const { timeRange = '30d' } = req.query;

      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Get profile views
      const { data: viewsData } = await supabase
        .from('provider_views')
        .select('*')
        .eq('provider_id', providerId)
        .gte('created_at', startDate.toISOString());

      // Get leads data
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          users:user_id (name, email),
          events:event_id (event_type, prompt),
          tasks:step_id (step_title)
        `)
        .eq('provider_id', providerId)
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const profileViews = {
        total: viewsData?.length || 0,
        this_month: viewsData?.filter(v => {
          const viewDate = new Date(v.created_at);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return viewDate >= monthAgo;
        }).length || 0,
        last_month: viewsData?.filter(v => {
          const viewDate = new Date(v.created_at);
          const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return viewDate >= twoMonthsAgo && viewDate < monthAgo;
        }).length || 0,
      };

      const leads = {
        total: leadsData?.length || 0,
        this_month: leadsData?.filter(l => {
          const leadDate = new Date(l.created_at);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return leadDate >= monthAgo;
        }).length || 0,
        conversion_rate: profileViews.total > 0 ? ((leadsData?.length || 0) / profileViews.total * 100) : 0,
        by_status: {
          new: leadsData?.filter(l => l.status === 'new').length || 0,
          contacted: leadsData?.filter(l => l.status === 'contacted').length || 0,
          booked: leadsData?.filter(l => l.status === 'booked').length || 0,
        }
      };

      const revenue = {
        total_bookings: leadsData?.filter(l => l.status === 'booked').length || 0,
        estimated_value: (leadsData?.filter(l => l.status === 'booked').length || 0) * 3000, // Estimate $3k per booking
        this_month: (leadsData?.filter(l => {
          const leadDate = new Date(l.created_at);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return leadDate >= monthAgo && l.status === 'booked';
        }).length || 0) * 3000,
      };

      const performance = {
        response_time_avg: 2.5, // Mock data - would calculate from actual response times
        rating_avg: 4.8, // Mock data - would get from reviews
        completion_rate: leads.total > 0 ? (leads.by_status.booked / leads.total * 100) : 0,
      };

      // Recent activity
      const recentActivity = [
        ...viewsData?.slice(-5).map(v => ({
          id: v.id,
          type: 'view',
          description: 'Profile viewed by potential customer',
          created_at: v.created_at
        })) || [],
        ...leadsData?.slice(-5).map(l => ({
          id: l.id,
          type: l.status === 'booked' ? 'booking' : 'lead',
          description: l.status === 'booked' 
            ? `Booking confirmed for ${l.events?.event_type}` 
            : `New lead for ${l.events?.event_type}`,
          created_at: l.created_at
        })) || []
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      const analytics = {
        profile_views: profileViews,
        leads,
        revenue,
        performance,
        recent_activity: recentActivity
      };

      res.json({ analytics });

    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  recordProviderView: async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;
      const { user_id } = req.body;

      // Record view (anonymous views allowed)
      const { error } = await supabase
        .from('provider_views')
        .insert({
          provider_id: providerId,
          user_id: user_id || null,
          ip_address: req.ip,
          user_agent: req.get('User-Agent') || null,
        });

      if (error) {
        console.error('Record view error:', error);
        return res.status(500).json({ error: 'Failed to record view' });
      }

      res.json({ success: true });

    } catch (error) {
      console.error('Record view error:', error);
      res.status(500).json({ error: 'Failed to record view' });
    }
  }
};