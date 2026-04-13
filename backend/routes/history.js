import express from 'express';
import supabase from '../lib/supabase.js';

const router = express.Router();

// IMPORTANT: specific routes before dynamic ones to avoid conflicts

// Get single history entry by id
router.get('/entry/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true, entry: data });
  } catch (err) {
    console.error('History entry fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Delete history entry
router.delete('/entry/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    console.error('History delete error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Get user's analysis history (dynamic route last)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const { data, error, count } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Supabase history error:', error);
      throw error;
    }

    res.json({
      success: true,
      history: data || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
