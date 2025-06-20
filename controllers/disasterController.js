const supabase = require('../services/supabaseClient');

const createDisaster = async (req, res) => {
  try {
    const { title, location_name, lat, lng, description, tags, owner_id } =
      req.body;

    const { data, error } = await supabase.from('disasters').insert([
      {
        title,
        location_name,
        location: `POINT(${lng} ${lat})`,
        description,
        tags,
        owner_id,
        audit_trail: [
          {
            action: 'create',
            user_id: owner_id,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ]);

    if (error) throw error;

    return res.status(201).json({ message: 'Disaster created', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create disaster' });
  }
};

const getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = supabase
      .from('disasters')
      .select('*')
      .order('created_at', { ascending: false });

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch disasters' });
  }
};

const updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Add to audit trail
    const { data: current, error: fetchError } = await supabase
      .from('disasters')
      .select('audit_trail')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const auditTrail = current.audit_trail || [];
    auditTrail.push({
      action: 'update',
      user_id: updates.owner_id || 'unknown',
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('disasters')
      .update({ ...updates, audit_trail: auditTrail })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Disaster updated', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update disaster' });
  }
};

const deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Disaster deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete disaster' });
  }
};

module.exports = {
  createDisaster,
  getDisasters,
  updateDisaster,
  deleteDisaster,
};
