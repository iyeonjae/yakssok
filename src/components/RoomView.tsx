import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { Users, Share2, ArrowLeft, Loader2, Check, Copy, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import type { Room, ResponseData } from '../types';

interface RoomViewProps {
  roomId: string;
  onBack: () => void;
}

export default function RoomView({ roomId, onBack }: RoomViewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRespond, setShowRespond] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      const roomDoc = await getDoc(doc(db, 'rooms', roomId));
      if (roomDoc.exists()) {
        setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
      }
      setLoading(false);
    };

    fetchRoom();

    const q = query(collection(db, 'rooms', roomId, 'responses'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResponseData));
      setResponses(data);
    });

    return () => unsubscribe();
  }, [roomId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-yakssok-primary" size={48} />
        <p className="mt-4 text-zinc-500 font-medium">약속 방을 불러오는 중...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-zinc-800">방을 찾을 수 없습니다.</h2>
        <button onClick={onBack} className="mt-4 text-yakssok-primary font-bold underline">홈으로 이동</button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-start mb-10">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-yakssok-muted hover:text-yakssok-primary mb-3 transition-colors text-xs font-bold uppercase tracking-widest italic"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
          <h2 className="text-4xl font-serif font-bold text-yakssok-primary leading-tight">{room.title}</h2>
          <p className="text-yakssok-muted font-medium mt-2 flex items-center gap-2">
            <CalendarIcon size={16} />
            {format(parseISO(room.startDate), 'yyyy.MM.dd')} — {format(parseISO(room.endDate), 'yyyy.MM.dd')}
          </p>
        </div>
        <button 
          onClick={copyLink}
          className={cn(
            "p-3.5 rounded-2xl transition-all border flex items-center gap-2 font-bold cursor-pointer shadow-sm",
            copied 
              ? "bg-yakssok-highlight border-yakssok-highlight text-white scale-95" 
              : "bg-white border-yakssok-warm text-yakssok-primary hover:border-yakssok-primary"
          )}
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          <span className="hidden sm:inline">{copied ? '복사됨!' : '링크 공유'}</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-black/[0.03] border border-yakssok-primary/5 overflow-hidden mb-12">
        <div className="flex border-b border-yakssok-warm/50 bg-yakssok-warm/10">
          <button 
            onClick={() => setShowRespond(true)}
            className={cn(
              "flex-1 py-5 font-bold transition-all cursor-pointer text-lg",
              showRespond 
                ? "text-yakssok-primary bg-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-yakssok-primary" 
                : "text-yakssok-muted hover:text-yakssok-primary hover:bg-white/50"
            )}
          >
            응답하기
          </button>
          <button 
            onClick={() => setShowRespond(false)}
            className={cn(
              "flex-1 py-5 font-bold transition-all cursor-pointer text-lg",
              !showRespond 
                ? "text-yakssok-primary bg-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-yakssok-primary" 
                : "text-yakssok-muted hover:text-yakssok-primary hover:bg-white/50"
            )}
          >
            결과보기 ({responses.length})
          </button>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {showRespond ? (
              <motion.div
                key="respond"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RespondForm room={room} onSubmitted={() => setShowRespond(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ResultView room={room} responses={responses} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function RespondForm({ room, onSubmitted }: { room: Room, onSubmitted: () => void }) {
  const [name, setName] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const days = eachDayOfInterval({
    start: parseISO(room.startDate),
    end: parseISO(room.endDate)
  });

  const toggleDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert('이름을 입력해주세요.');
    if (selectedDates.length === 0) return alert('가능한 날짜를 하나 이상 선택해주세요.');

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'rooms', room.id, 'responses'), {
        name: name.trim(),
        selectedDates,
        updatedAt: new Date().toISOString()
      });
      onSubmitted();
    } catch (err) {
      console.error(err);
      alert('제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-yakssok-muted mb-3 italic">참여자 이름</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full px-6 py-4 rounded-xl border border-yakssok-warm bg-yakssok-warm/30 focus:outline-none focus:ring-2 focus:ring-yakssok-primary/20 focus:bg-white focus:border-yakssok-primary transition-all text-lg font-serif"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-yakssok-muted mb-5 flex items-center gap-2 italic">
          <CalendarIcon size={14} className="text-yakssok-secondary" />
          가능한 날짜를 선택해주세요
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {days.map((day) => {
            const isSelected = selectedDates.includes(format(day, 'yyyy-MM-dd'));
            return (
              <button
                key={day.toISOString()}
                onClick={() => toggleDate(day)}
                className={cn(
                  "aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer group",
                  isSelected 
                    ? "bg-yakssok-primary border-yakssok-primary text-white shadow-lg shadow-yakssok-primary/20 scale-105" 
                    : "bg-yakssok-warm/20 border-yakssok-warm/50 text-yakssok-muted hover:border-yakssok-primary hover:bg-white"
                )}
              >
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-tighter opacity-70",
                  isSelected ? "text-white" : "text-yakssok-muted group-hover:text-yakssok-primary"
                )}>{format(day, 'EEE')}</span>
                <span className="text-xl font-serif font-black">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-yakssok-primary text-white py-5 rounded-full font-bold text-xl shadow-xl shadow-yakssok-primary/30 hover:shadow-yakssok-primary/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
      >
        {submitting ? <Loader2 className="animate-spin" /> : <><Check size={24} strokeWidth={3} /> 제출하기</>}
      </button>
    </div>
  );
}

function ResultView({ room, responses }: { room: Room, responses: ResponseData[] }) {
  const days = eachDayOfInterval({
    start: parseISO(room.startDate),
    end: parseISO(room.endDate)
  });

  const dateCounts: Record<string, number> = {};
  responses.forEach(res => {
    res.selectedDates.forEach(date => {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
  });

  const maxCount = responses.length > 0 ? Math.max(...Object.values(dateCounts), 0) : 0;
  
  if (responses.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="bg-yakssok-warm p-6 rounded-full text-yakssok-secondary mb-6 shadow-inner">
          <Users size={40} />
        </div>
        <p className="text-yakssok-muted font-serif text-lg italic leading-relaxed">아직 응답이 없습니다. <br /> 친구들에게 링크를 보내 알려주세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="bg-yakssok-accent/20 border border-yakssok-accent/40 rounded-[24px] p-6 flex gap-4 items-start shadow-sm shadow-black/[0.01]">
        <Info className="text-yakssok-primary shrink-0 mt-0.5" size={24} />
        <p className="text-yakssok-primary/90 leading-relaxed font-medium">
          <strong className="font-serif italic text-lg">초록색</strong>이 진할수록 더 많은 사람이 가능한 날짜입니다.<br />
          가장 많이 겹치는 날은 <span className="underline decoration-yakssok-highlight underline-offset-4 decoration-2 font-bold uppercase tracking-widest text-xs">BEST</span> 라벨로 표시됩니다.
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {days.map((day) => {
          const count = dateCounts[format(day, 'yyyy-MM-dd')] || 0;
          const isBest = count > 0 && count === maxCount;
          const opacity = responses.length > 0 ? (count / responses.length) : 0;
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square rounded-2xl border flex flex-col items-center justify-center relative transition-all overflow-hidden",
                isBest ? "border-yakssok-highlight ring-4 ring-yakssok-highlight/20" : "border-yakssok-warm"
              )}
            >
              {isBest && (
                <div className="absolute top-1 left-1.5 z-20">
                  <span className="bg-yakssok-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">BEST</span>
                </div>
              )}
              <div 
                className="absolute inset-0 transition-colors duration-700"
                style={{ 
                  backgroundColor: opacity > 0 
                    ? (isBest ? '#7FB069' : '#D4E2D4') 
                    : '#fcfcf9',
                  opacity: opacity > 0 ? (isBest ? 1 : Math.max(0.3, opacity)) : 1
                }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-tighter",
                  (isBest || opacity > 0.8) ? "text-white" : "text-yakssok-muted"
                )}>{format(day, 'EEE')}</span>
                <span className={cn(
                  "text-xl font-serif font-black",
                  (isBest || opacity > 0.8) ? "text-white" : "text-yakssok-text"
                )}>{format(day, 'd')}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full shadow-sm",
                    (isBest || opacity > 0.8) ? "bg-white text-yakssok-primary" : "bg-yakssok-primary text-white"
                  )}>
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-yakssok-warm/50 pt-10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-yakssok-muted mb-8 flex items-center gap-3 italic">
          <Users size={16} className="text-yakssok-secondary" /> 응답 현황 (Participants)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {responses.map((res) => (
            <div key={res.id} className="flex items-center gap-4 bg-yakssok-warm/10 p-4 rounded-[20px] border border-yakssok-warm/30 shadow-sm shadow-black/[0.01]">
              <div className="w-12 h-12 rounded-full bg-yakssok-secondary text-white flex items-center justify-center font-serif font-bold text-xl shadow-inner">
                {res.name[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-serif font-bold text-yakssok-primary text-lg">{res.name}</span>
                  <span className="text-[10px] bg-yakssok-accent text-yakssok-primary px-2 font-bold rounded-full">완료</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {res.selectedDates.sort().map(d => (
                    <span key={d} className="text-[10px] font-bold text-yakssok-muted whitespace-nowrap">
                      #{format(parseISO(d), 'M/d')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
