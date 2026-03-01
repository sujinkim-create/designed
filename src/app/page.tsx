'use client';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../components/App'), { ssr: false });

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50">
            <App />
        </main>
    );
}
