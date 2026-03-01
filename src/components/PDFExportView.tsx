import React, { useMemo } from 'react';
import { StudyPack, VocabItem } from '../types';

interface PDFExportViewProps {
    studyData: StudyPack;
    topic: string;
}

const PDFExportView: React.FC<PDFExportViewProps> = ({ studyData, topic }) => {
    // Prepare data for Vocabulary Match (Words vs Shuffled Definitions)
    const matchData = useMemo(() => {
        const words = studyData.vocabulary.map((v, i) => ({ ...v, originalIndex: i }));
        const definitions = [...studyData.vocabulary]
            .map((v, i) => ({ def: v.definition, originalIndex: i }))
            .sort(() => Math.random() - 0.5);
        return { words, definitions };
    }, [studyData.vocabulary]);

    return (
        <div className="font-sans text-black bg-white" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
            <h1 className="text-4xl font-bold mb-4 text-center border-b-4 border-black pb-6">
                Lingoleap Study Pack
            </h1>
            <h2 className="text-2xl text-center mb-12 font-medium text-slate-800">{topic}</h2>

            {/* 1. Vocabulary List */}
            <section className="mb-12">
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                    1. Vocabulary List
                </h3>
                <div className="space-y-6">
                    {studyData.vocabulary.map((item, index) => (
                        <div key={index} className="grid grid-cols-[140px_1fr] gap-6 break-inside-avoid border-b border-slate-200 pb-4 last:border-0">
                            <div className="font-bold text-xl">{item.word}</div>
                            <div>
                                <p className="font-medium text-lg mb-2 leading-relaxed">{item.definition}</p>
                                <p className="text-base text-slate-600 italic">"{item.example}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Vocabulary Match */}
            <section className="mb-12 break-before-page">
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                    2. Vocabulary Match
                </h3>
                <p className="mb-6 text-lg">Match the words on the left with their definitions on the right.</p>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {matchData.words.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200 break-inside-avoid">
                                <span className="font-bold text-slate-500 w-6">{index + 1}.</span>
                                <span className="font-bold text-lg">{item.word}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {matchData.definitions.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200 break-inside-avoid">
                                <span className="font-bold text-slate-500 w-6 mt-0.5">{String.fromCharCode(65 + index)}.</span>
                                <span className="text-base leading-snug">{item.def}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Spelling Practice */}
            <section className="mb-12">
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                    3. Spelling Practice
                </h3>
                <p className="mb-6 text-lg">Write the correct word based on the definition and example.</p>
                <div className="space-y-6">
                    {studyData.vocabulary.map((item, index) => (
                        <div key={index} className="break-inside-avoid bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-slate-500">{index + 1}.</span>
                            </div>
                            <p className="font-medium mb-2">{item.definition}</p>
                            <p className="text-slate-600 italic mb-4">
                                "{item.example.replace(new RegExp(item.word, 'gi'), '__________')}"
                            </p>
                            <div className="border-b-2 border-slate-300 h-8 w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Collocations */}
            {studyData.collocations.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                        4. Collocations
                    </h3>
                    <div className="space-y-6">
                        {studyData.collocations.map((item, index) => (
                            <div key={index} className="grid grid-cols-[180px_1fr] gap-6 break-inside-avoid border-b border-slate-200 pb-4 last:border-0">
                                <div className="font-bold text-lg">{item.phrase}</div>
                                <div>
                                    <p className="text-lg mb-2 leading-relaxed">{item.definition}</p>
                                    <p className="text-base text-slate-600 italic">"{item.example}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. Grammar Focus */}
            {studyData.grammar.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                        5. Grammar Focus
                    </h3>
                    <div className="space-y-8">
                        {studyData.grammar.map((point, index) => (
                            <div key={index} className="break-inside-avoid bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-xl mb-3 text-slate-900">{point.rule}</h4>
                                <p className="mb-4 text-lg leading-relaxed text-slate-800">{point.explanation}</p>
                                <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-slate-400">
                                    <p className="text-base italic text-slate-700">Ex: {point.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 6. Quiz: Multiple Choice */}
            {studyData.mcq.length > 0 && (
                <section className="mb-12 break-before-page">
                    <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                        6. Quiz: Multiple Choice
                    </h3>
                    <div className="space-y-8">
                        {studyData.mcq.map((q, index) => (
                            <div key={q.id} className="break-inside-avoid">
                                <p className="font-bold text-lg mb-4">{index + 1}. {q.question}</p>
                                <div className="grid grid-cols-2 gap-4 pl-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center text-sm font-bold text-slate-600">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="text-lg">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 7. Quiz: Fill in the Blanks */}
            {studyData.cloze.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                        7. Quiz: Fill in the Blanks
                    </h3>
                    <div className="space-y-6">
                        {studyData.cloze.map((q, index) => (
                            <div key={q.id} className="break-inside-avoid bg-slate-50 p-4 rounded-lg">
                                <p className="mb-3 text-lg leading-loose">
                                    {index + 1}. {q.sentencePart1} <span className="inline-block w-24 border-b-2 border-black mx-1"></span> {q.sentencePart2}
                                </p>
                                <div className="flex flex-wrap gap-3 pl-4 text-base text-slate-700">
                                    <span className="font-bold text-slate-500">Options:</span>
                                    {q.options.map((opt, i) => (
                                        <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200">{opt}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 8. Discussion */}
            {studyData.discussion.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-2">
                        8. Discussion Questions
                    </h3>
                    <div className="space-y-6">
                        {studyData.discussion.map((item, index) => (
                            <div key={index} className="break-inside-avoid bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <p className="font-bold text-lg mb-3 text-slate-900">Q{index + 1}: {item.question}</p>
                                <p className="text-slate-600 italic">Model Answer: {item.modelAnswer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Answer Key */}
            <section className="mt-16 pt-10 border-t-4 border-black break-inside-avoid">
                <h3 className="text-xl font-bold mb-6 uppercase tracking-widest">Answer Key</h3>
                <div className="grid grid-cols-2 gap-12">
                    {/* Match Answers */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-slate-500 uppercase">Vocabulary Match</h4>
                        <div className="grid grid-cols-5 gap-y-3 gap-x-4 text-base">
                            {matchData.words.map((w, i) => {
                                const defIndex = matchData.definitions.findIndex(d => d.originalIndex === w.originalIndex);
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="font-bold text-slate-400">{i + 1}.</span>
                                        <span>{String.fromCharCode(65 + defIndex)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Spelling Answers */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-slate-500 uppercase">Spelling Practice</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                            {studyData.vocabulary.map((v, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">{i + 1}.</span>
                                    <span>{v.word}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MCQ Answers */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-slate-500 uppercase">Multiple Choice</h4>
                        <div className="grid grid-cols-5 gap-y-3 gap-x-4 text-base">
                            {studyData.mcq.map((q, i) => (
                                <div key={q.id} className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">{i + 1}.</span>
                                    <span>{String.fromCharCode(65 + q.correctIndex)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cloze Answers */}
                    <div>
                        <h4 className="font-bold text-base mb-4 text-slate-500 uppercase">Fill in the Blanks</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base">
                            {studyData.cloze.map((q, i) => (
                                <div key={q.id} className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">{i + 1}.</span>
                                    <span>{q.answer}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PDFExportView;
