export interface ChatMessage {
    id: string;
    sessionId: string;
    message: string;
    timestamp: string;
    isUser: boolean;
}

export interface ChatInput {
    sessionId: string;
    chatInput: string;
}

export interface ChatResponse {
    success: boolean;
    message: string;
    data?: unknown;
}