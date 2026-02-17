import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { birthDate, birthTime } = body;

        if (!birthDate) {
            return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
        }

        // Backend URL (Environment variable or default to localhost for development)
        // Ensure BACKEND_URL in Vercel is set to https://soul-stat-backend.onrender.com (no trailing slash)
        const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

        console.log(`Proxying request to: ${BACKEND_URL}/analyze`);

        // Call the FastAPI backend
        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ birthDate, birthTime }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend Error:', errorText);
            return NextResponse.json({ error: `Backend failed: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
