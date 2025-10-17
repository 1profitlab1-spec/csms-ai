import React, { useState, useEffect } from 'react';
import { Mission } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { simulateScenarioStream } from '../../services/geminiService';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ScenarioSimulatorProps {
    missions: Mission[];
    initialQuery?: string | null;
}

const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ missions, initialQuery }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    useEffect(() => {
        if(initialQuery) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setResult('');

        try {
            const stream = simulateScenarioStream(query, missions);
            for await (const chunk of stream) {
                setResult(prev => prev + chunk);
            }
        } catch (error) {
            console.error("Simulation error:", error);
            setResult("An error occurred during the simulation.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const cleanHtml = DOMPurify.sanitize(marked.parse(result));

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Icon name="lightbulb" className="w-5 h-5 text-purple-400" />
                "What-If" Scenario Simulator
            </h3>
            <div className="flex-grow overflow-y-auto min-h-[150px] bg-brand-dark p-3 rounded-md my-4">
                {result ? (
                     <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
                ) : (
                    <p className="text-sm text-brand-text-secondary text-center py-8">Ask Oracle to simulate an outcome.</p>
                )}
                 {isLoading && !result && <Icon name="loader" className="mx-auto text-brand-text-secondary" />}
            </div>
            <form onSubmit={handleSubmit}>
                <Textarea 
                    placeholder='e.g., "What if I had used a sales-focused squad on my last marketing mission?"'
                    rows={3}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" className="w-full mt-3" disabled={isLoading || !query.trim()}>
                    {isLoading ? <Icon name="loader" /> : "Run Simulation"}
                </Button>
            </form>
        </Card>
    );
};

export default ScenarioSimulator;