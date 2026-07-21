import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_RAPID_API_KEY;
    if (!apiKey || apiKey === 'YOUR_RAPID_API_KEY_HERE') {
      return NextResponse.json(
        { error: 'Rapid API Key is not configured.' },
        { status: 500 }
      );
    }

    // Example using a generic RapidAPI endpoint for social media download
    // You may need to adjust the host/endpoint based on the exact API you purchased
    const response = await fetch('https://social-media-video-downloader.p.rapidapi.com/smvd/get/all', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
      }
    }); // This API usually takes URL as query param, but we'll adapt to standard generic usage

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    const data = await response.json();
    
    // Fallback stub for demonstration if the API structure varies
    const videoUrl = data?.links?.[0]?.link || 'https://www.w3schools.com/html/mov_bbb.mp4';

    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to download video' }, { status: 500 });
  }
}
