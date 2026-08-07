import type { APIRoute } from 'astro';
import { getOrCreateParticipant, getAllParticipants } from '../../lib/db';

export const GET: APIRoute = async () => {
  const participants = await getAllParticipants();
  return new Response(JSON.stringify(participants), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const name = (body?.name ?? '').toString().trim();

    if (!name) {
      return new Response(JSON.stringify({ error: 'El nombre es requerido' }), { status: 400 });
    }
    if (name.length > 40) {
      return new Response(
        JSON.stringify({ error: 'El nombre es muy largo (máx. 40 caracteres)' }),
        { status: 400 }
      );
    }

    const participant = await getOrCreateParticipant(name);
    return new Response(JSON.stringify(participant), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Ocurrió un error al registrar' }), { status: 500 });
  }
};