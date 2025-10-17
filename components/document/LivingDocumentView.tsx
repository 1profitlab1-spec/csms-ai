// components/document/LivingDocumentView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mission, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import ShowcaseMissionModal from './ShowcaseMissionModal';

interface LivingDocumentViewProps {
  user: User;
  mission: Mission;
  isUpdating: boolean;
  placementModeActive: boolean;
  onPlaceVisual: (insertIndex: number) => void;
  onCancelPlacement: () => void;
  onToggleHuddle: () => void;
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
  isHuddleVisible: boolean;
}

const LivingDocumentView: React.FC<LivingDocumentViewProps> = ({
  user,
  mission,
  isUpdating,
  placementModeActive,
  onPlaceVisual,
  onCancelPlacement,
  onToggleHuddle,
  onToggleSidebar,
  isSidebarVisible,
  isHuddleVisible,
}) => {
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fullDocumentContent = useMemo(() => mission.document.map(s => s.content).join('\n\n---\n\n'), [mission.document]);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementModeActive || !contentRef.current) return;

    // A simplified way to get character index on click.
    // This is not perfectly accurate but sufficient for this purpose.
    const range = document.createRange();
    range.selectNode(contentRef.current);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const clickRange = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (clickRange) {
        range.setEnd(clickRange.startContainer, clickRange.startOffset);
        onPlaceVisual(range.toString().length);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-brand-dark overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0 z-10 bg-brand-dark/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* This button is for mobile view to open the sidebar (mission list) */}
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
              <Icon name="menu" className="w-5 h-5" />
          </Button>
          {/* This button is for desktop to hide/show the sidebar */}
           {!isSidebarVisible && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden lg:inline-flex">
              <Icon name="menu" className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-semibold truncate">{mission.title}</h2>
            <div className="flex items-center -space-x-2 mt-1">
              {mission.agents.map(agent => (
                <div key={agent.name} className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={agent.name}>
                  <Icon name={agent.icon} className={`w-3.5 h-3.5 ${agent.color}`} />
                </div>
              ))}
              <span className="text-xs text-brand-text-secondary pl-3">{mission.agents.length} Agents</span>
            </div>
          </div>
        </div>
        <div className="items-center gap-2 flex-shrink-0 hidden lg:flex">
          <Button variant="outline" onClick={() => setIsShowcaseModalOpen(true)}>
            <Icon name="sparkles" className="w-4 h-4 mr-2" />
            Showcase Mission
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleHuddle}>
             <Icon name={isHuddleVisible ? 'users' : 'chevron-left'} className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {placementModeActive && (
        <div className="p-2 bg-purple-900 text-center text-sm animate-pulse flex items-center justify-center gap-3">
          <Icon name="plus" className="w-4 h-4" />
          <span>Placement Mode: Click in the document where you want to add the visual.</span>
          <Button variant="ghost" size="sm" onClick={onCancelPlacement}>Cancel</Button>
        </div>
      )}

      <ScrollArea className="flex-1 relative">
        <div 
          ref={contentRef}
          className={`prose prose-invert max-w-4xl mx-auto p-8 lg:p-12 pb-24 ${placementModeActive ? 'cursor-copy' : ''}`}
          onClick={handleContentClick}
        >
          {/* This is a simplified renderer. A real app might use a more complex editor. */}
          <RenderedMarkdown content={fullDocumentContent} />
        </div>
         {isUpdating && (
            <div className="absolute inset-0 bg-brand-dark/50 flex items-center justify-center z-20">
                <div className="flex items-center gap-3 p-4 bg-brand-darker rounded-lg">
                    <Icon name="loader" className="w-6 h-6 text-purple-400" />
                    <span className="text-white">Document is being updated...</span>
                </div>
            </div>
        )}
      </ScrollArea>
      
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-darker/80 backdrop-blur-sm border-t border-brand-border z-20 grid grid-cols-3 gap-2 p-2">
         <Button variant="ghost" className="flex-col h-auto py-2" onClick={onToggleSidebar}>
            <Icon name="message-square" className="w-5 h-5 mb-1" />
            <span className="text-xs">Missions</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2" onClick={() => setIsShowcaseModalOpen(true)}>
            <Icon name="sparkles" className="w-5 h-5 mb-1" />
            <span className="text-xs">Showcase</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2" onClick={onToggleHuddle}>
            <Icon name="users" className="w-5 h-5 mb-1" />
            <span className="text-xs">Huddle</span>
        </Button>
      </div>

      {isShowcaseModalOpen && (
        <ShowcaseMissionModal user={user} mission={mission} onClose={() => setIsShowcaseModalOpen(false)} />
      )}
    </div>
  );
};

// This component handles rendering markdown, including mermaid diagrams
const RenderedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        const dirtyHtml = marked.parse(content, { breaks: true, gfm: true });
        containerRef.current.innerHTML = DOMPurify.sanitize(dirtyHtml, { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] });

        // Find and render mermaid diagrams
        const mermaidElements = containerRef.current.querySelectorAll('code.language-mermaid');
        mermaidElements.forEach((el, i) => {
            const id = `doc-mermaid-${Date.now()}-${i}`;
            const code = el.textContent || '';
            
            // The container for the SVG
            const svgContainer = document.createElement('div');
            svgContainer.className = 'mermaid-container';
            (el.parentElement as HTMLElement)?.replaceWith(svgContainer);

            try {
                mermaid.render(id, code, (svg) => {
                    svgContainer.innerHTML = svg;
                });
            } catch (error) {
                console.error("Mermaid render error in document:", error);
                svgContainer.innerHTML = `<p class="text-red-400">Error rendering diagram</p>`;
            }
        });
    }
  }, [content]);

  return <div ref={containerRef} />;
};


export default LivingDocumentView;