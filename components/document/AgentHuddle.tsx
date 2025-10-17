// FIX: Removed invalid CDATA wrapper from file.
// components/document/AgentHuddle.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HuddleMessage, Mission, Agent, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ScrollArea } from '../ui/ScrollArea';
// FIX: Import the Input component to resolve the 'Cannot find name' error.
import { Input } from '../ui/Input';
import { generateAgentHuddleResponseStream, generateImageFromPrompt } from '../../services/geminiService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import mermaid from 'mermaid';
import ShareInsightModal from './ShareInsightModal';

interface AgentHuddleProps {
  user: User;
  mission: Mission;
  documentContent: string;
  messages: HuddleMessage[];
  onHuddleUpdate: (updatedMessages: HuddleMessage[]) => void;
  onExecuteDocumentCommand: (command: string) => void;
  onPromoteToDocument: (text: string) => void;
  onInitiatePlacement: (code: string, type: 'mermaid' | 'image') => void;
  onMobileBack?: () => void;
}

const AgentHuddle: React.FC<AgentHuddleProps> = ({
  user,
  mission,
  documentContent,
  messages,
  onHuddleUpdate,
  onExecuteDocumentCommand,
  onPromoteToDocument,
  onInitiatePlacement,
  onMobileBack,
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'question' | 'command'>('question');
  const [targetedAgents, setTargetedAgents] = useState<Agent[]>([]);
  const [isTargetPopoverOpen, setIsTargetPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [insightToShare, setInsightToShare] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: behavior,
        block: 'end'
      });
    }
  };

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (el) {
      const isScrolledUp = el.scrollHeight - el.clientHeight - el.scrollTop > 200;
      setIsUserScrolledUp(isScrolledUp);
    }
  };

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    // Only auto-scroll if the user isn't intentionally scrolled up
    const isNearBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 200;
    if (isNearBottom) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    if (mode === 'command') {
      onExecuteDocumentCommand(input.trim());
      setInput('');
      return;
    }

    setIsLoading(true);
    const newUserMessage: HuddleMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const agentMessageId = `agent-msg-${Date.now()}`;
    const initialAgentMessage: HuddleMessage = {
      id: agentMessageId,
      type: 'agent',
      text: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    const updatedMessages = [...messages, newUserMessage, initialAgentMessage];
    onHuddleUpdate(updatedMessages);
    setInput('');
    setTimeout(() => scrollToBottom('auto'), 0);

    try {
        const stream = generateAgentHuddleResponseStream(updatedMessages, mission.agents, documentContent, targetedAgents);
        let fullResponse = "";
        let visualCode = "";
        let visualType: 'mermaid' | 'image' | undefined;

        for await (const chunk of stream) {
            fullResponse += chunk;
            
            const visualMatch = fullResponse.match(/\[VISUAL_START:(mermaid|image)\]([\s\S]*?)\[VISUAL_END\]/);
            
            let textPart = fullResponse;
            if (visualMatch) {
                textPart = fullResponse.replace(visualMatch[0], '').trim();
                visualType = visualMatch[1] as 'mermaid' | 'image';
                visualCode = visualMatch[2];
            }
            
            onHuddleUpdate([
                ...messages,
                newUserMessage,
                { ...initialAgentMessage, text: textPart, visualCode, visualType, isLoading: true }
            ]);
        }
        
        let finalVisualCode = visualCode;
        if (visualType === 'image' && visualCode) {
            const base64 = await generateImageFromPrompt(visualCode);
            finalVisualCode = `data:image/png;base64,${base64}`;
        }
        
        const finalAgentMessage = { 
            ...initialAgentMessage, 
            text: fullResponse.replace(/\[VISUAL_START:(mermaid|image)\]([\s\S]*?)\[VISUAL_END\]/, '').trim(),
            visualCode: finalVisualCode,
            visualType,
            isLoading: false 
        };
        onHuddleUpdate([...messages, newUserMessage, finalAgentMessage]);

    } catch (error) {
        console.error("Error getting agent response:", error);
        const errorMessage: HuddleMessage = { ...initialAgentMessage, text: "Sorry, an error occurred.", isLoading: false };
        onHuddleUpdate([...messages, newUserMessage, errorMessage]);
    } finally {
        setIsLoading(false);
        setTargetedAgents([]);
    }
  };
  
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages;
    }
    return messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);
  
  return (
    <div className="flex flex-col h-full w-full flex-shrink-0 bg-brand-dark border-l border-brand-border">
      <header className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0">
        <div className="flex items-center gap-3">
          {onMobileBack && (
            <Button variant="ghost" size="icon" onClick={onMobileBack} className="lg:hidden">
              <Icon name="chevron-left" className="w-5 h-5" />
            </Button>
          )}
          <Icon name="users" className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-semibold">Agent Huddle</h2>
        </div>
        <div className="relative flex-1 mx-4 max-w-xs hidden sm:block">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-9"
            />
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} onScroll={handleScroll} className="flex-1 p-4 relative">
        <div className="space-y-6">
          {filteredMessages.map((msg, index) => (
            <div key={msg.id} ref={index === filteredMessages.length - 1 ? lastMessageRef : null}>
                <MessageBubble 
                    message={msg} 
                    onPromoteToDocument={onPromoteToDocument}
                    onInitiatePlacement={onInitiatePlacement}
                    onShareInsight={() => setInsightToShare(msg.text)}
                />
            </div>
          ))}
        </div>
        {isUserScrolledUp && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <Button size="sm" variant="secondary" onClick={() => scrollToBottom('smooth')} className="shadow-lg rounded-full h-8 w-8 p-0">
                    <Icon name="chevron-down" className="w-4 h-4" />
                </Button>
            </div>
        )}
      </ScrollArea>

      <div className="border-t border-brand-border p-4 bg-brand-dark flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Button variant={mode === 'question' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('question')}>
                <Icon name="message-circle" className="w-4 h-4 mr-2" /> Quick Question
            </Button>
            <Button variant={mode === 'command' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('command')}>
                <Icon name="pen-tool" className="w-4 h-4 mr-2" /> Document Command
            </Button>
            <div className="relative">
                 <Button variant="ghost" size="sm" onClick={() => setIsTargetPopoverOpen(!isTargetPopoverOpen)}>
                    <Icon name="target" className="w-4 h-4 mr-2" /> 
                    Target {targetedAgents.length > 0 && `(${targetedAgents.length})`}
                </Button>
                {isTargetPopoverOpen && (
                    <div className="absolute bottom-full mb-2 w-56 bg-brand-medium border border-brand-border rounded-lg p-2 z-20">
                       <p className="text-xs text-brand-text-secondary px-2 pb-2">Select agents to consult:</p>
                        {mission.agents.map(agent => (
                            <label key={agent.name} className="flex items-center gap-2 p-2 hover:bg-brand-dark rounded-md cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="accent-purple-500"
                                    checked={targetedAgents.some(a => a.name === agent.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setTargetedAgents(prev => [...prev, agent]);
                                        } else {
                                            setTargetedAgents(prev => prev.filter(a => a.name !== agent.name));
                                        }
                                    }}
                                />
                                <span className="text-sm">{agent.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <form onSubmit={handleSendMessage}>
            <div className="relative">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'question' ? 'Ask your squad...' : 'Enter a command...'}
                    className="pr-12"
                    rows={2}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage(e);
                        }
                    }}
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Icon name="loader" /> : <Icon name="send" />}
                    </Button>
                </div>
            </div>
        </form>
      </div>
      {insightToShare && (
        <ShareInsightModal
            user={user}
            insight={insightToShare}
            onClose={() => setInsightToShare(null)}
        />
      )}
    </div>
  );
};

const MessageBubble: React.FC<{ message: HuddleMessage, onPromoteToDocument: (text: string) => void, onInitiatePlacement: (code: string, type: 'mermaid' | 'image') => void, onShareInsight: () => void }> = ({ message, onPromoteToDocument, onInitiatePlacement, onShareInsight }) => {
    const cleanHtml = useMemo(() => {
        const dirty = marked.parse(message.text, { breaks: true });
        return DOMPurify.sanitize(dirty);
    }, [message.text]);

    return (
        <div className={`flex flex-col items-stretch ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-[90%] ${message.type === 'user' ? 'bg-purple-600' : 'bg-brand-medium'}`}>
                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
                {message.visualCode && (
                    <div className="mt-2 border-t border-purple-500/30 pt-2">
                        {message.visualType === 'image' ? (
                            <img src={message.visualCode} alt="Generated visual" className="rounded-md" />
                        ) : (
                            <MermaidPreview code={message.visualCode} />
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => onInitiatePlacement(message.visualCode!, message.visualType!)}
                        >
                            <Icon name="plus" className="w-4 h-4 mr-2" /> Apply to Document
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-2 text-left w-full max-w-[90%] flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onPromoteToDocument(message.text)}
                    className="flex items-center gap-2 text-brand-text-secondary hover:text-white px-2"
                >
                    <Icon name="pen-tool" className="w-4 h-4" />
                    <span>Apply</span>
                </Button>
                {message.type === 'agent' && (
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onShareInsight}
                        className="flex items-center gap-2 text-brand-text-secondary hover:text-white px-2"
                    >
                        <Icon name="share-2" className="w-4 h-4" />
                        <span>Share</span>
                    </Button>
                )}
            </div>

             {message.isLoading && (
                <div className="flex items-center justify-start mt-2 p-2 bg-brand-medium rounded-lg w-full max-w-[90%]">
                <Icon name="loader" className="w-5 h-5 text-purple-400 mr-3" />
                <span className="text-sm text-brand-text-secondary">Agents are thinking...</span>
                </div>
            )}
        </div>
    );
};

const MermaidPreview: React.FC<{ code: string }> = ({ code }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current && code) {
            const renderMermaid = async () => {
                if (!ref.current) return;
                const id = `huddle-preview-${Math.random().toString(36).substring(7)}`;
                try {
                    const { svg } = await mermaid.render(id, code);
                    if (ref.current) {
                        ref.current.innerHTML = svg;
                    }
                } catch(e) {
                    console.error("Huddle Mermaid preview error", e);
                    if (ref.current) {
                        ref.current.innerHTML = `<p class="text-xs text-red-400">Preview render error</p>`;
                    }
                }
            };
            renderMermaid();
        }
    }, [code]);
    return <div ref={ref} className="bg-brand-darker p-2 rounded-md flex justify-center" />;
};

export default AgentHuddle;