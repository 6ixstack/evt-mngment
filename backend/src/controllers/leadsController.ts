import { Response } from 'express';
import { supabase } from '../utils/supabase';
import { AuthRequest } from '../middleware/auth';

export class LeadsController {
  async createLead(req: AuthRequest, res: Response) {
    try {
      const {
        provider_id,
        event_id,
        step_id,
        message
      } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only regular users can create leads
      if (req.user.type !== 'user') {
        return res.status(403).json({ error: 'Only users can create leads' });
      }

      // Validate that the event belongs to the user
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, user_id')
        .eq('id', event_id)
        .eq('user_id', req.user.id)
        .single();

      if (eventError || !eventData) {
        return res.status(404).json({ error: 'Event not found or not authorized' });
      }

      // Validate that the step belongs to the event
      if (step_id) {
        const { data: stepData, error: stepError } = await supabase
          .from('tasks')
          .select('id, event_id')
          .eq('id', step_id)
          .eq('event_id', event_id)
          .single();

        if (stepError || !stepData) {
          return res.status(404).json({ error: 'Step not found or not part of this event' });
        }
      }

      // Validate that the provider exists and is active
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id, business_name, is_active, subscription_status')
        .eq('id', provider_id)
        .single();

      if (providerError || !providerData) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (!providerData.is_active || providerData.subscription_status !== 'active') {
        return res.status(400).json({ error: 'Provider is not available' });
      }

      // Check if lead already exists for this user-provider-event combination
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('provider_id', provider_id)
        .eq('event_id', event_id)
        .single();

      if (existingLead) {
        return res.status(400).json({ error: 'Lead already exists for this provider and event' });
      }

      // Create the lead
      const { data: newLead, error: createError } = await supabase
        .from('leads')
        .insert({
          provider_id,
          event_id,
          user_id: req.user.id,
          step_id,
          message,
          status: 'new'
        })
        .select(`
          id,
          provider_id,
          event_id,
          user_id,
          step_id,
          message,
          status,
          created_at,
          providers!leads_provider_id_fkey(id, business_name, provider_type),
          events!leads_event_id_fkey(id, event_type, prompt),
          tasks!leads_step_id_fkey(id, step_title, description)
        `)
        .single();

      if (createError) {
        console.error('Lead creation error:', createError);
        return res.status(500).json({ error: 'Failed to create lead' });
      }

      res.status(201).json({
        lead: newLead,
        message: 'Lead created successfully'
      });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeads(req: AuthRequest, res: Response) {
    try {
      const { status, event_id, limit = 20, offset = 0 } = req.query;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      let query = supabase
        .from('leads')
        .select(`
          id,
          provider_id,
          event_id,
          user_id,
          step_id,
          message,
          status,
          created_at,
          providers!leads_provider_id_fkey(id, business_name, provider_type, location_city, location_province),
          events!leads_event_id_fkey(id, event_type, prompt),
          tasks!leads_step_id_fkey(id, step_title, description),
          users!leads_user_id_fkey(id, name, email)
        `);

      // Authorization: Users see their own leads, providers see leads for their services
      if (req.user.type === 'user') {
        query = query.eq('user_id', req.user.id);
      } else if (req.user.type === 'provider') {
        // Get the provider's ID first
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', req.user.id)
          .single();

        if (providerError || !providerData) {
          return res.status(404).json({ error: 'Provider profile not found' });
        }

        query = query.eq('provider_id', providerData.id);
      }

      // Filter by status if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Filter by event if provided (only for users)
      if (event_id && req.user.type === 'user') {
        query = query.eq('event_id', event_id);
      }

      // Apply pagination
      query = query
        .range(Number(offset), Number(offset) + Number(limit) - 1)
        .order('created_at', { ascending: false });

      const { data: leads, error } = await query;

      if (error) {
        console.error('Leads fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch leads' });
      }

      res.json({
        leads: leads || [],
        total: leads?.length || 0,
        offset: Number(offset),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateLead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get the existing lead
      const { data: existingLead, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id,
          provider_id,
          user_id,
          status,
          providers!leads_provider_id_fkey(user_id)
        `)
        .eq('id', id)
        .single();

      if (fetchError || !existingLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Authorization check
      let canUpdate = false;
      
      if (req.user.type === 'user' && existingLead.user_id === req.user.id) {
        canUpdate = true;
      } else if (req.user.type === 'provider' && (existingLead.providers as any)?.user_id === req.user.id) {
        canUpdate = true;
      }

      if (!canUpdate) {
        return res.status(403).json({ error: 'Not authorized to update this lead' });
      }

      // Prepare update data
      const updateData: any = {};
      
      if (status !== undefined) {
        // Validate status values
        const validStatuses = ['new', 'contacted', 'booked'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
        }
        updateData.status = status;
      }

      if (message !== undefined) {
        updateData.message = message;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      // Update the lead
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          provider_id,
          event_id,
          user_id,
          step_id,
          message,
          status,
          created_at,
          providers!leads_provider_id_fkey(id, business_name, provider_type, location_city, location_province),
          events!leads_event_id_fkey(id, event_type, prompt),
          tasks!leads_step_id_fkey(id, step_title, description),
          users!leads_user_id_fkey(id, name, email)
        `)
        .single();

      if (updateError) {
        console.error('Lead update error:', updateError);
        return res.status(500).json({ error: 'Failed to update lead' });
      }

      res.json({
        lead: updatedLead,
        message: 'Lead updated successfully'
      });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteLead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get the existing lead
      const { data: existingLead, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id,
          provider_id,
          user_id,
          providers!leads_provider_id_fkey(user_id)
        `)
        .eq('id', id)
        .single();

      if (fetchError || !existingLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Authorization check - only the user who created the lead can delete it
      if (req.user.type !== 'user' || existingLead.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this lead' });
      }

      // Delete the lead
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Lead deletion error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete lead' });
      }

      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeadStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      let query = supabase.from('leads').select('status');

      // Apply same authorization logic
      if (req.user.type === 'user') {
        query = query.eq('user_id', req.user.id);
      } else if (req.user.type === 'provider') {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', req.user.id)
          .single();

        if (providerError || !providerData) {
          return res.status(404).json({ error: 'Provider profile not found' });
        }

        query = query.eq('provider_id', providerData.id);
      }

      const { data: leads, error } = await query;

      if (error) {
        console.error('Lead stats error:', error);
        return res.status(500).json({ error: 'Failed to fetch lead statistics' });
      }

      // Calculate statistics
      const stats = {
        total: leads?.length || 0,
        new: leads?.filter(lead => lead.status === 'new').length || 0,
        contacted: leads?.filter(lead => lead.status === 'contacted').length || 0,
        booked: leads?.filter(lead => lead.status === 'booked').length || 0
      };

      res.json({ stats });
    } catch (error) {
      console.error('Get lead stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}