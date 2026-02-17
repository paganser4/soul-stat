import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import util from 'node:util';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { birthDate, birthTime } = body;

        if (!birthDate) {
            return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
        }

        // Call the Python script
        // Note: Adjust the python path and script path as needed for your environment
        const pythonScriptPath = 'c:\\Users\\lg\\사주 프로그램 만들기\\backend\\saju_engine.py';

        // Execute with arguments: date and time
        // Set PYTHONIOENCODING to utf-8 to ensure correct output on Windows
        const { stdout, stderr } = await execPromise(`python "${pythonScriptPath}" "${birthDate}" "${birthTime}"`, {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        if (stderr) {
            console.error('Python Error:', stderr);
        }

        console.log('Python Output:', stdout);

        try {
            const result = JSON.parse(stdout);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Output:', stdout);
            return NextResponse.json({ error: 'Failed to parsing analysis result' }, { status: 500 });
        }

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
