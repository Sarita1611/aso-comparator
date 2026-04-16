import express from 'express';
import supabase from '../lib/supabase.js';

const router = express.Router();

// Get all analysis history (global, no auth)
router.get('/all', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const { data, error, count } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

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

// Delete history entry (no auth check)
router.delete('/entry/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    console.error('History delete error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
