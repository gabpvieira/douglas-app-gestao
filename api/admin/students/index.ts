import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_lib/supabase';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;
    const idParam = Array.isArray(id) ? id[0] : id;

    try {
        const supabase = getSupabaseAdmin();

        // Operações com ID (GET single, PUT, DELETE)
        if (idParam) {
            if (req.method === 'GET') {
                const { data, error } = await supabase
                    .from('users_profile')
                    .select('*')
                    .eq('id', idParam)
                    .single();

                if (error) throw error;
                return res.status(200).json(data);
            }

            if (req.method === 'PUT') {
                const { data, error } = await supabase
                    .from('users_profile')
                    .update(req.body)
                    .eq('id', idParam)
                    .select()
                    .single();

                if (error) throw error;
                return res.status(200).json(data);
            }

            if (req.method === 'DELETE') {
                const { error } = await supabase
                    .from('users_profile')
                    .delete()
                    .eq('id', idParam);

                if (error) throw error;
                return res.status(200).json({ success: true });
            }
        }

        // Operações sem ID (Listar todos)
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('users_profile')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data || []);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Error in student API:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
