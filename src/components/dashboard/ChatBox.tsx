'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessage } from '@/types/chat'
import { sendChatMessage } from '@/lib/chat'
import { useUser } from '@/hooks/use-user'
import ReactMarkdown from 'react-markdown'

export function ChatBox() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useUser()

    // Scroll to bottom when new messages are added
    const messagesEndRef = useRef<HTMLDivElement>(null)
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted', { input, userId: user?.id })
        
        if (!input.trim() || !user?.id) {
            console.log('Missing input or user ID', { input: input.trim(), userId: user?.id })
            return
        }

        setIsLoading(true)
        console.log('Setting loading state to true')

        try {
            // Add user message to chat
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                sessionId: user.id,
                message: input,
                timestamp: new Date().toISOString(),
                isUser: true
            }
            console.log('Adding user message to chat:', userMessage)
            setMessages(prev => [...prev, userMessage])
            
            console.log('Calling sendChatMessage with:', {
                sessionId: user.id,
                chatInput: input.trim()
            });

            const response = await sendChatMessage({
                sessionId: user.id,
                chatInput: input.trim()
            });

            console.log('Got response from sendChatMessage:', response);

            if (response.success) {
                console.log('Message sent successfully, clearing input');
                setInput('');
                
                // Add bot response to chat
                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sessionId: user.id,
                    message: response.data?.output?.chatOutput || 'No response received',
                    timestamp: new Date().toISOString(),
                    isUser: false
                };
                
                console.log('Adding bot message to chat:', botMessage);
                setMessages(prev => {
                    console.log('Current messages:', prev);
                    return [...prev, botMessage];
                });
            } else {
                console.error('Failed to get response from chat');
                setError('No se pudo obtener respuesta del chat');
            }
        } catch (error) {
            console.error('Error in chat:', error)
            setError(error instanceof Error ? error.message : 'Error al enviar el mensaje')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="bg-background p-4 rounded-t-lg border-b flex-none">
                <h2 className="text-lg font-semibold">Chat Assistant</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                        {error}
                    </div>
                )}
                
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.isUser
                                    ? 'bg-primary text-primary-foreground ml-4'
                                    : 'bg-muted mr-4'
                            }`}
                        >
                            {message.isUser ? (
                                message.message
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            code: ({ node, ...props }) => (
                                                <code className="bg-muted-foreground/20 rounded px-1 py-0.5" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="my-2 list-disc list-inside" {...props} />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li className="my-1" {...props} />
                                            )
                                        }}
                                    >
                                        {message.message}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form 
                onSubmit={(e) => {
                    console.log('Form onSubmit triggered')
                    handleSubmit(e)
                }} 
                className="p-4 border-t flex-none bg-background"
            >
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => {
                            console.log('Input changed:', e.target.value)
                            setInput(e.target.value)
                        }}
                        placeholder="Type a message..."
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        onClick={() => console.log('Send button clicked')}
                    >
                        Send {isLoading ? '...' : ''}
                    </Button>
                </div>
            </form>
        </div>
    )
}