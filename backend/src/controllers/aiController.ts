import { Response } from 'express';
import OpenAI from 'openai';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../utils/supabase';

export class AIController {
  private openai: OpenAI;

  constructor() {
    console.log('🤖 Initializing AI Controller...');
    console.log('Azure API Key:', process.env.AZURE_OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('Azure Endpoint:', process.env.AZURE_OPENAI_ENDPOINT || 'Missing');
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    // Prefer Azure OpenAI, fallback to OpenAI
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      console.log('🔵 Using Azure OpenAI');
      this.openai = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: process.env.AZURE_OPENAI_ENDPOINT,
        defaultQuery: { 'api-version': '2025-01-01-preview' },
        defaultHeaders: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
        },
      });
    } else if (process.env.OPENAI_API_KEY) {
      console.log('🟢 Using OpenAI');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.error('❌ No AI API keys configured');
      throw new Error('Either AZURE_OPENAI_API_KEY + AZURE_OPENAI_ENDPOINT or OPENAI_API_KEY must be configured');
    }
    
    console.log('✅ AI Controller initialized successfully');
  }

  async generatePlan(req: AuthRequest, res: Response) {
    try {
      const { event_type, prompt } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const systemPrompt = `You are an expert wedding and event planner. Based on the user's description, create a comprehensive step-by-step checklist for planning their event. 

      Return your response as a JSON array of objects, where each object has:
      - step_title: A clear, actionable title (e.g., "Book a Venue")
      - description: A detailed description of what needs to be done
      - tags: An array of relevant provider types that could help with this step (e.g., ["venue"], ["catering", "halal"], ["photographer", "videographer"])

      Provider types to use in tags: venue, catering, photographer, videographer, florist, decorator, music, transportation, makeup, clothing, jewelry, invitations, other

      Focus on creating 5-8 key steps that cover all major aspects of event planning. Be specific about requirements mentioned in the user's prompt (like halal food, specific locations, guest count, etc.).`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Event Type: ${event_type}\n\nDescription: ${prompt}` }
        ],
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        return res.status(500).json({ error: 'Failed to generate plan' });
      }

      let checklist;
      try {
        checklist = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }

      // Create event record
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: req.user.id,
          event_type,
          prompt,
          checklist_json: checklist
        })
        .select()
        .single();

      if (eventError) {
        console.error('Failed to save event:', eventError);
        return res.status(500).json({ error: 'Failed to save event' });
      }

      // Create tasks for each step
      const tasks = checklist.map((step: any, index: number) => ({
        event_id: eventData.id,
        step_title: step.step_title,
        description: step.description,
        order_number: index + 1,
        matching_provider_ids: []
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks);

      if (tasksError) {
        console.error('Failed to save tasks:', tasksError);
      }

      // Find matching providers for each step
      for (let i = 0; i < checklist.length; i++) {
        const step = checklist[i];
        const matchingProviders = await this.findMatchingProviders(step.tags, prompt);
        checklist[i].matching_providers = matchingProviders;
      }

      res.json({
        event: eventData,
        checklist,
        message: 'Plan generated successfully'
      });
    } catch (error) {
      console.error('AI generate plan error:', error);
      res.status(500).json({ error: 'Failed to generate plan' });
    }
  }

  async refineStep(req: AuthRequest, res: Response) {
    try {
      const { event_id, step_id, refinement_prompt } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get the original event and step
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', event_id)
        .eq('user_id', req.user.id)
        .single();

      if (eventError || !eventData) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const { data: stepData, error: stepError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', step_id)
        .eq('event_id', event_id)
        .single();

      if (stepError || !stepData) {
        return res.status(404).json({ error: 'Step not found' });
      }

      const refinementSystemPrompt = `You are an expert event planner helping refine a specific step in an event plan. Based on the original event description and the user's refinement request, provide an updated list of matching providers.

      Return your response as a JSON object with:
      - updated_description: Updated description for this step based on the refinement
      - provider_tags: Array of provider types that match the refined requirements
      - search_criteria: Additional criteria to filter providers (city, tags, etc.)

      Provider types: venue, catering, photographer, videographer, florist, decorator, music, transportation, makeup, clothing, jewelry, invitations, other`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: refinementSystemPrompt },
          { 
            role: "user", 
            content: `Original Event: ${eventData.prompt}\n\nStep: ${stepData.step_title} - ${stepData.description}\n\nRefinement Request: ${refinement_prompt}` 
          }
        ],
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        return res.status(500).json({ error: 'Failed to refine step' });
      }

      let refinementResult;
      try {
        refinementResult = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }

      // Update the task with refinement
      await supabase
        .from('tasks')
        .update({
          refinement_prompt,
          description: refinementResult.updated_description || stepData.description
        })
        .eq('id', step_id);

      // Find matching providers based on refinement
      const matchingProviders = await this.findMatchingProviders(
        refinementResult.provider_tags,
        `${eventData.prompt} ${refinement_prompt}`,
        refinementResult.search_criteria
      );

      res.json({
        updated_step: {
          ...stepData,
          description: refinementResult.updated_description || stepData.description,
          refinement_prompt
        },
        matching_providers: matchingProviders,
        message: 'Step refined successfully'
      });
    } catch (error) {
      console.error('AI refine step error:', error);
      res.status(500).json({ error: 'Failed to refine step' });
    }
  }

  private async findMatchingProviders(tags: string[], context: string, additionalCriteria?: any) {
    try {
      let query = supabase
        .from('providers')
        .select(`
          id,
          business_name,
          provider_type,
          location_city,
          location_province,
          description,
          tags,
          logo_url,
          users!providers_user_id_fkey(name, email)
        `)
        .eq('is_active', true);

      // Filter by provider types if specified
      if (tags && tags.length > 0) {
        query = query.in('provider_type', tags);
      }

      // Add location filtering based on context
      const cityMatch = context.toLowerCase().match(/in\s+([a-zA-Z\s]+?)(?:\s+in|\s*,|\s*$)/);
      if (cityMatch) {
        const city = cityMatch[1].trim();
        query = query.ilike('location_city', `%${city}%`);
      }

      const { data: providers, error } = await query.limit(10);

      if (error) {
        console.error('Provider search error:', error);
        return [];
      }

      // Score and sort providers based on tag matches and context relevance
      const scoredProviders = providers?.map(provider => {
        let score = 0;
        
        // Type match
        if (tags.includes(provider.provider_type)) {
          score += 10;
        }

        // Tag matches
        provider.tags.forEach((tag: string) => {
          if (context.toLowerCase().includes(tag.toLowerCase())) {
            score += 5;
          }
        });

        // Description relevance (simple keyword matching)
        const contextWords = context.toLowerCase().split(/\s+/);
        const descWords = provider.description.toLowerCase().split(/\s+/);
        const commonWords = contextWords.filter(word => 
          word.length > 3 && descWords.includes(word)
        );
        score += commonWords.length * 2;

        return { ...provider, relevance_score: score };
      }).sort((a, b) => b.relevance_score - a.relevance_score) || [];

      return scoredProviders.slice(0, 6); // Return top 6 matches
    } catch (error) {
      console.error('Error finding matching providers:', error);
      return [];
    }
  }
}