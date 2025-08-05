import { Request, Response } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase';

export const uploadController = {
  uploadFile: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { folder = 'uploads' } = req.body;
      const fileId = uuidv4();
      const fileExtension = req.file.mimetype.split('/')[1];
      const fileName = `${folder}/${fileId}.${fileExtension}`;

      // Process image with Sharp
      let processedBuffer = req.file.buffer;
      
      // Optimize image
      if (req.file.mimetype.startsWith('image/')) {
        processedBuffer = await sharp(req.file.buffer)
          .resize(2000, 2000, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toBuffer();
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, processedBuffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      res.json({
        success: true,
        url: urlData.publicUrl,
        fileName: data.path
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
};