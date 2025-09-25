'use server'

import { ChatInput, ChatResponse } from "@/types/chat"

export async function sendChatMessage(input: ChatInput): Promise<ChatResponse> {
    console.log('Server action: sendChatMessage called with input:', input);
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_CHAT_URL
        console.log('Webhook URL:', webhookUrl);

        if (!webhookUrl) {
            console.error('N8N webhook URL not configured');
            throw new Error('N8N webhook URL not configured')
        }

        console.log('Sending message to webhook:', input);
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store'
        })

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.error('Failed to send message:', response.status, response.statusText);
            throw new Error('Failed to send message: ' + response.statusText)
        }

        const data = await response.json()
        console.log('Webhook response data:', data);
        
        const result = {
            success: true,
            message: 'Message sent successfully',
            data: {
                output: {
                    chatOutput: data.output?.chatOutput || data.message || 'No response received'
                }
            }
        };
        
        console.log('Returning result:', result);
        return result;
    } catch (error) {
        console.error('Error sending chat message:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}