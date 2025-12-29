export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      return Response.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const response = await fetch(`${apiUrl}/levels/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${process.env.EXTERNAL_API_KEY}`, // Hidden from client
      },
    });

    console.log('External API response:', response.status);

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Levels fetched successfully');

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return Response.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}
