import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { AuthRequest } from '../middleware/auth';
import { ProviderType, SubscriptionStatus } from '../types';

export class ProvidersController {
  async getProviders(req: Request, res: Response) {
    try {
      const { 
        type, 
        city, 
        province, 
        tags, 
        lat, 
        lng, 
        radius = 50, 
        limit = 20, 
        offset = 0,
        search 
      } = req.query;

      let query = supabase
        .from('providers')
        .select(`
          id,
          business_name,
          provider_type,
          phone,
          location_city,
          location_province,
          location_lat,
          location_lng,
          description,
          tags,
          logo_url,
          sample_images,
          subscription_status,
          created_at,
          updated_at,
          users!providers_user_id_fkey(id, name, email)
        `)
        .eq('is_active', true)
        .eq('subscription_status', 'active');

      // Filter by provider type
      if (type) {
        query = query.eq('provider_type', type);
      }

      // Filter by city
      if (city) {
        query = query.ilike('location_city', `%${city}%`);
      }

      // Filter by province
      if (province) {
        query = query.ilike('location_province', `%${province}%`);
      }

      // Filter by tags
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query = query.overlaps('tags', tagArray);
      }

      // Search in business name and description
      if (search) {
        query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply pagination
      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data: providers, error } = await query;

      if (error) {
        console.error('Providers fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch providers' });
      }

      let sortedProviders = providers || [];

      // Apply geolocation-based sorting if coordinates provided
      if (lat && lng) {
        const userLat = Number(lat);
        const userLng = Number(lng);
        const maxRadius = Number(radius);

        sortedProviders = providers
          ?.map(provider => {
            if (provider.location_lat && provider.location_lng) {
              const distance = this.calculateDistance(
                userLat, 
                userLng, 
                provider.location_lat, 
                provider.location_lng
              );
              return { ...provider, distance };
            }
            return { ...provider, distance: null };
          })
          .filter(provider => 
            provider.distance === null || provider.distance <= maxRadius
          )
          .sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          }) || [];
      }

      res.json({
        providers: sortedProviders,
        total: sortedProviders.length,
        offset: Number(offset),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProvider(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: provider, error } = await supabase
        .from('providers')
        .select(`
          id,
          business_name,
          provider_type,
          phone,
          location_city,
          location_province,
          location_lat,
          location_lng,
          description,
          tags,
          logo_url,
          sample_images,
          is_active,
          subscription_status,
          created_at,
          updated_at,
          users!providers_user_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Provider fetch error:', error);
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (!provider.is_active) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json({ provider });
    } catch (error) {
      console.error('Get provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProvider(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        business_name,
        provider_type,
        phone,
        location_city,
        location_province,
        location_lat,
        location_lng,
        description,
        tags,
        logo_url,
        sample_images
      } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Check if the user owns this provider profile
      const { data: existingProvider, error: fetchError } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (existingProvider.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this provider' });
      }

      // Update the provider
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (business_name !== undefined) updateData.business_name = business_name;
      if (provider_type !== undefined) updateData.provider_type = provider_type;
      if (phone !== undefined) updateData.phone = phone;
      if (location_city !== undefined) updateData.location_city = location_city;
      if (location_province !== undefined) updateData.location_province = location_province;
      if (location_lat !== undefined) updateData.location_lat = location_lat;
      if (location_lng !== undefined) updateData.location_lng = location_lng;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (logo_url !== undefined) updateData.logo_url = logo_url;
      if (sample_images !== undefined) updateData.sample_images = sample_images;

      const { data: updatedProvider, error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          business_name,
          provider_type,
          phone,
          location_city,
          location_province,
          location_lat,
          location_lng,
          description,
          tags,
          logo_url,
          sample_images,
          is_active,
          subscription_status,
          created_at,
          updated_at,
          users!providers_user_id_fkey(id, name, email)
        `)
        .single();

      if (updateError) {
        console.error('Provider update error:', updateError);
        return res.status(500).json({ error: 'Failed to update provider' });
      }

      res.json({
        provider: updatedProvider,
        message: 'Provider updated successfully'
      });
    } catch (error) {
      console.error('Update provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createProvider(req: AuthRequest, res: Response) {
    try {
      const {
        business_name,
        provider_type,
        phone,
        location_city,
        location_province,
        location_lat,
        location_lng,
        description,
        tags = [],
        logo_url,
        sample_images = []
      } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can create provider profiles' });
      }

      // Check if user already has a provider profile
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (existingProvider) {
        return res.status(400).json({ error: 'Provider profile already exists' });
      }

      // Create provider profile
      const { data: newProvider, error: createError } = await supabase
        .from('providers')
        .insert({
          user_id: req.user.id,
          business_name,
          provider_type,
          phone,
          location_city,
          location_province,
          location_lat,
          location_lng,
          description,
          tags,
          logo_url,
          sample_images,
          is_active: true,
          subscription_status: 'inactive' as SubscriptionStatus
        })
        .select(`
          id,
          business_name,
          provider_type,
          phone,
          location_city,
          location_province,
          location_lat,
          location_lng,
          description,
          tags,
          logo_url,
          sample_images,
          is_active,
          subscription_status,
          created_at,
          updated_at,
          users!providers_user_id_fkey(id, name, email)
        `)
        .single();

      if (createError) {
        console.error('Provider creation error:', createError);
        return res.status(500).json({ error: 'Failed to create provider profile' });
      }

      res.status(201).json({
        provider: newProvider,
        message: 'Provider profile created successfully'
      });
    } catch (error) {
      console.error('Create provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProvider(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Check if the user owns this provider profile
      const { data: existingProvider, error: fetchError } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      if (existingProvider.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this provider' });
      }

      // Soft delete by setting is_active to false
      const { error: deleteError } = await supabase
        .from('providers')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deleteError) {
        console.error('Provider deletion error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete provider' });
      }

      res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
      console.error('Delete provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}