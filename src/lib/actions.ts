'use server';

interface N8NHealthResponse {
  status: string;
}

export async function checkN8NHealth(): Promise<{ isOnline: boolean; error?: string }> {
  const webhookUrl = process.env.N8N_WEBHOOK_HEALTH_URL;
  
  if (!webhookUrl) {
    return { isOnline: false, error: 'N8N webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const data: N8NHealthResponse = await response.json();
      return { isOnline: data.status === 'ok' };
    } else {
      return { isOnline: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Error checking N8N health:', error);
    return { 
      isOnline: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
