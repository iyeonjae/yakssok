/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Plus, Users, Share2, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { format, addDays, startOfDay, isWithinInterval, isSameDay, parseISO, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import type { Room, ResponseData } from './types';

// Components
import Home from './components/Home';
import CreateRoom from './components/CreateRoom';
import RoomView from './components/RoomView';

export default function App() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'create' | 'room'>('home');
  const [loading, setLoading] = useState(false);

  // Simple routing based on URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      setCurrentRoomId(roomId);
      setView('room');
    }
  }, []);

  const navigateToCreate = () => setView('create');
  const navigateToHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setView('home');
    setCurrentRoomId(null);
  };

  const handleRoomCreated = (id: string) => {
    const newUrl = `${window.location.pathname}?room=${id}`;
    window.history.pushState({ room: id }, '', newUrl);
    setCurrentRoomId(id);
    setView('room');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-yakssok-warm text-yakssok-text">
      <header className="w-full max-w-4xl px-12 py-10 flex justify-between items-center">
        <button 
          onClick={navigateToHome}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="bg-yakssok-primary p-2.5 rounded-full text-white transition-transform group-hover:scale-110 shadow-lg shadow-yakssok-primary/20">
            <Calendar size={24} />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-yakssok-primary">약속 <span className="text-yakssok-secondary text-sm font-sans font-medium uppercase tracking-widest ml-1">Yakssok</span></h1>
        </button>
      </header>

      <main className="w-full max-w-4xl px-12 pb-20">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Home onCreateClick={navigateToCreate} />
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CreateRoom onRoomCreated={handleRoomCreated} onBack={navigateToHome} />
            </motion.div>
          )}

          {view === 'room' && currentRoomId && (
            <motion.div
              key="room"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RoomView roomId={currentRoomId} onBack={navigateToHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-zinc-400 text-sm">
        © 2026 Yakssok - Simple Schedule Coordination
      </footer>
    </div>
  );
}
