import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import util from 'node:util';

const execPromise = util.promisify(exec);

// Allow longer timeout for AI generation (e.g. 60 seconds)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { birthDate } = body;

        if (!birthDate) {
            return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
        }

        // Backend URL (Environment variable or default to localhost for development)
        const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

        // Call the FastAPI backend
        const response = await fetch(`${BACKEND_URL}/analyze/deep`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend Error:', errorText);
            return NextResponse.json({ error: 'Failed to generate report from backend' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
