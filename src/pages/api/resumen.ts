import type { APIRoute } from 'astro';
import { getAggregatedAvailability, getAllParticipants } from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const aggregated = await getAggregatedAvailability();
    const participants = await getAllParticipants();
    return new Response(
      JSON.stringify({ aggregated, totalParticipants: participants.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al generar resumen' }), { status: 500 });
  }
};