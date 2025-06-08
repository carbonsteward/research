import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/questionnaire';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  User,
  Building
} from 'lucide-react';

interface ChatWidgetProps {
  matchId?: number;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ChatWidget({ matchId, isOpen = false, onToggle }: ChatWidgetProps) {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId && isOpen,
  });

  const { sendMessage: sendWebSocketMessage } = useWebSocket(isOpen ? '/ws' : undefined);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const res = await apiRequest('POST', `/api/matches/${matchId}/messages`, {
        message: messageText,
      });
      return res.json();
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });

      // Send via WebSocket for real-time delivery
      sendWebSocketMessage({
        type: 'chat_message',
        data: {
          matchId,
          message: newMessage,
        },
      });

      setMessage('');
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !matchId) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="w-14 h-14 rounded-full shadow-lg twiga-button-primary relative"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Unread message indicator */}
          <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center bg-red-500 text-white">
            3
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-200 ${
        isMinimized ? 'h-16' : 'h-96'
      }`}>
        <CardHeader className="p-4 bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">Impact Ventures</CardTitle>
                <p className="text-xs text-primary-foreground/80">Online</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.senderId === 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === 1 ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="twiga-button-primary"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
