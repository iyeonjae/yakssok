import { motion } from 'motion/react';
import { Calendar, Plus, Users, Link as LinkIcon } from 'lucide-react';

interface HomeProps {
  onCreateClick: () => void;
}

export default function Home({ onCreateClick }: HomeProps) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-28 h-28 bg-yakssok-primary/10 text-yakssok-primary rounded-[40px] flex items-center justify-center mb-10 shadow-inner"
      >
        <Calendar size={56} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-serif font-bold text-yakssok-primary mb-6 leading-tight italic"
      >
        모두가 가능한 날짜를 <br />
        <span className="text-yakssok-secondary not-italic">단 1분만에</span> 찾으세요.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-yakssok-muted mb-14 max-w-lg leading-relaxed"
      >
        로그인 없이 간편하게 방을 만들고 공유하세요. <br />
        겹치는 일정을 자동으로 계산해 드립니다.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateClick}
        className="flex items-center gap-3 bg-yakssok-primary text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-yakssok-primary/30 cursor-pointer transition-shadow hover:shadow-yakssok-primary/40"
      >
        <Plus size={26} strokeWidth={3} />
        방 만들기
      </motion.button>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-4xl px-4">
        {[
          { icon: LinkIcon, title: "링크 공유", desc: "생성된 링크를 친구들에게 보내세요." },
          { icon: Users, title: "간편 응답", desc: "참여자는 이름만 쓰고 선택하면 끝!" },
          { icon: Calendar, title: "결과 확인", desc: "가장 많이 겹치는 날을 한눈에." }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex flex-col items-center p-8 bg-white rounded-[32px] shadow-lg shadow-black/[0.02] border border-yakssok-primary/5"
          >
            <div className="w-16 h-16 bg-yakssok-warm rounded-2xl flex items-center justify-center mb-6">
              <item.icon className="text-yakssok-primary" size={32} />
            </div>
            <h3 className="font-serif font-bold text-yakssok-text text-lg mb-3">{item.title}</h3>
            <p className="text-sm text-yakssok-muted leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
