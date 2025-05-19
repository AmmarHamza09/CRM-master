// pages/api/events/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  switch (req.method) {
    case 'GET':
      try {
        const event = await prisma.calendarEvent.findUnique({ where: { id } });
        if (!event) {
          res.status(404).json({ error: 'Event not found' });
        } else {
          res.status(200).json(event);
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
      }
      break;

    case 'PUT':
      const { title, description, start, end, allDay, color } = req.body;
      try {
        const updated = await prisma.calendarEvent.update({
          where: { id },
          data: {
            title,
            description,
            start: new Date(start),
            end: end ? new Date(end) : null,
            allDay,
            color,
          },
        });
        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.calendarEvent.delete({ where: { id } });
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
