import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Test creating an event
        const testEvent = await prisma.calendarEvent.create({
            data: {
                title: 'Test Event',
                description: 'This is a test event',
                start: new Date(),
                end: new Date(Date.now() + 3600000), // 1 hour later
                allDay: false,
                color: '#3b82f6',
            },
        });

        // Test fetching the event
        const fetchedEvent = await prisma.calendarEvent.findUnique({
            where: { id: testEvent.id },
        });

        // Test updating the event
        const updatedEvent = await prisma.calendarEvent.update({
            where: { id: testEvent.id },
            data: {
                title: 'Updated Test Event',
            },
        });

        // Test deleting the event
        await prisma.calendarEvent.delete({
            where: { id: testEvent.id },
        });

        return NextResponse.json({
            message: 'All tests passed',
            testEvent,
            fetchedEvent,
            updatedEvent,
        });
    } catch (error) {
        console.error('Test failed:', error);
        return NextResponse.json(
            { error: 'Test failed', details: error },
            { status: 500 }
        );
    }
} 