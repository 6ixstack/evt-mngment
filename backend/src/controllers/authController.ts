import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name, type, ...providerData } = req.body;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ error: 'User creation failed' });
      }

      // Create user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          type: type || 'user'
        })
        .select()
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      // If provider, create provider record
      if (type === 'provider') {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: authData.user.id,
            business_name: providerData.business_name,
            provider_type: providerData.provider_type,
            phone: providerData.phone,
            location_city: providerData.location_city,
            location_province: providerData.location_province,
            location_lat: providerData.location_lat,
            location_lng: providerData.location_lng,
            description: providerData.description,
            tags: providerData.tags || []
          });

        if (providerError) {
          return res.status(500).json({ error: 'Failed to create provider profile' });
        }
      }

      res.status(201).json({
        user: userData,
        session: authData.session,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async signin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      res.json({
        user: userData,
        session: data.session,
        message: 'Sign in successful'
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async signout(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Sign out successful' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }

      // If provider, get provider data too
      if (userData.type === 'provider') {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', req.user.id)
          .single();

        if (!providerError) {
          userData.provider = providerData;
        }
      }

      res.json({ user: userData });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}