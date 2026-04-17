import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format, addDays } from 'date-fns';

interface CreateRoomProps {
  onRoomCreated: (id: string) => void;
  onBack: () => void;
}

export default function CreateRoom({ onRoomCreated, onBack }: CreateRoomProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('방 제목을 입력해주세요.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        title,
        startDate,
        endDate,
        createdAt: new Date().toISOString(),
      });
      onRoomCreated(docRef.id);
    } catch (err) {
      console.error(err);
      setError('방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-yakssok-muted hover:text-yakssok-primary mb-8 cursor-pointer transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        돌아가기
      </button>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-black/[0.03] border border-yakssok-primary/5">
        <h2 className="text-3xl font-serif font-bold text-yakssok-primary mb-10 flex items-center gap-3">
          <CalendarIcon className="text-yakssok-secondary" size={28} />
          새로운 약속 방 만들기
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-yakssok-muted mb-3 italic">방 제목</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='예: "MT 날짜 잡기", "동창회 모임"'
              className="w-full px-6 py-4 rounded-2xl border border-yakssok-warm bg-yakssok-warm/30 focus:outline-none focus:ring-2 focus:ring-yakssok-primary/20 focus:bg-white focus:border-yakssok-primary transition-all text-xl font-serif"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-yakssok-muted mb-3 italic">시작일</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-yakssok-warm bg-yakssok-warm/30 focus:outline-none focus:ring-2 focus:ring-yakssok-primary/20 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-yakssok-muted mb-3 italic">종료일</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-yakssok-warm bg-yakssok-warm/30 focus:outline-none focus:ring-2 focus:ring-yakssok-primary/20 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yakssok-primary text-white py-5 rounded-full font-bold text-xl shadow-xl shadow-yakssok-primary/30 hover:shadow-yakssok-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Check size={24} strokeWidth={3} />
                약속 방 만들기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
