export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate data here
    // Add authentication if needed

    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      return Response.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const response = await fetch(`${apiUrl}/createlevel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${process.env.EXTERNAL_API_KEY}`, // Hidden from client
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const result = await response.json();

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error submitting level:', error);
    return Response.json({ error: 'Failed to submit level' }, { status: 500 });
  }
}
