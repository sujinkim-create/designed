import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lookupWord, translateText } from '../services/openaiService';
import { Spinner } from '@phosphor-icons/react';

interface WordLookupProps {
    children: React.ReactNode;
}

const WordLookup: React.FC<WordLookupProps> = ({ children }) => {
    const [selection, setSelection] = useState<{ text: string; rect: DOMRect; context: string } | null>(null);
    const [definition, setDefinition] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-trigger lookup when selection changes
    useEffect(() => {
        if (selection) {
            handleLookup();
        }
    }, [selection]);

    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.toString().trim()) {
                // Only clear if clicking outside the tooltip
                // We'll handle clearing in a separate click listener
                return;
            }

            const text = sel.toString().trim();
            // Validation: ensure reasonable length
            if (text.length > 500) return;

            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Get context (surrounding sentence)
            let context = text;
            if (sel.anchorNode?.parentElement) {
                context = sel.anchorNode.parentElement.textContent || text;
            }

            setSelection({ text, rect, context });
            setDefinition(null); // Reset definition for new selection
        };

        const handleDocumentClick = (e: MouseEvent) => {
            // Clear selection if clicking outside
            const target = e.target as HTMLElement;
            if (!target.closest('.word-lookup-tooltip')) {
                setSelection(null);
                setDefinition(null);
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleDocumentClick);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    const isLongText = (text: string) => text.split(/\s+/).length > 3;

    const handleLookup = async () => {
        // Use a local variable to check current selection to avoid closure staleness if possible, 
        // though state 'selection' via dependency in useEffect is better.
        // Here we rely on the state being fresh when called via useEffect.
        setLoading(true);
        try {
            // We need to use the state 'selection' here. 
            // Note: In the useEffect above, we call handleLookup. 
            // We need to make sure handleLookup has access to the latest 'selection'.
            // Since handleLookup is defined inside the component, it captures the closure.
            // But if called from useEffect[selection], it will see the new selection.

            // Wait - we need to be careful. React state updates are async.
            // If we access 'selection' here directly, it will be the value from the render cycle where handleLookup was created.
            // If handleLookup is not wrapped in useCallback with [selection], it goes stale?
            // Actually, since we call it from useEffect[selection], the effect runs *after* render with new selection.
            // So the handleLookup generated *in that render* sees the new selection.
            // So this is safe.

            if (!selection) return;

            let result;
            if (isLongText(selection.text)) {
                result = await translateText(selection.text);
            } else {
                result = await lookupWord(selection.text, selection.context);
            }
            setDefinition(result);
        } catch (error) {
            console.error("Lookup/Translation failed", error);
            setDefinition("Could not fetch result.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef}>
            {children}
            {selection && createPortal(
                <div
                    className="word-lookup-tooltip fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: selection.rect.bottom + window.scrollY + 8,
                        left: selection.rect.left + window.scrollX + (selection.rect.width / 2),
                        transform: 'translateX(-50%)',
                        maxWidth: '320px'
                    }}
                >
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>

                    <div className="relative z-10">
                        {loading && (
                            <div className="flex items-center gap-2 px-4 py-2 text-slate-500 text-sm font-medium">
                                <Spinner size={18} className="animate-spin text-indigo-500" />
                                {isLongText(selection.text) ? "Translating..." : "Looking up..."}
                            </div>
                        )}

                        {definition && (
                            <div className="text-sm">
                                <p className="font-bold text-slate-800 mb-1 border-b border-slate-100 pb-1 truncate max-w-[280px]" title={selection.text}>
                                    {selection.text}
                                </p>
                                <p className="text-slate-600 leading-relaxed max-h-60 overflow-y-auto">
                                    {definition}
                                </p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default WordLookup;
