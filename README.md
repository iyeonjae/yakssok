

# 약속 | Yakssok

로그인 없이 약속 잡는 가장 간단한 방법. 방을 만들고 링크를 공유하면, 참여자들이 가능한 날짜를 선택하고 가장 많이 겹치는 날을 한눈에 확인할 수 있습니다.

🔗 **배포 주소:** https://yakssok-lilac.vercel.app

View your app in AI Studio: https://ai.studio/apps/0dfb2445-e5f6-4dc6-bb3c-329c350ee3a5

---

## 주요 기능

- **방 만들기** — 제목과 날짜 범위를 설정해 약속 방 생성
- **링크 공유** — 생성된 링크를 친구들에게 공유
- **간편 응답** — 이름 입력 후 가능한 날짜를 클릭으로 선택
- **결과 시각화** — 날짜별 참여 인원을 색상 농도로 표시, 가장 많이 겹치는 날에 **BEST** 라벨 표시
- **실시간 동기화** — Firebase Firestore 기반으로 응답이 즉시 반영

## 기술 스택

| 분류 | 내용 |
|------|------|
| Frontend | React 19, TypeScript, Vite |
| 스타일 | Tailwind CSS v4 |
| 데이터베이스 | Firebase Firestore |
| 애니메이션 | Motion (Framer Motion) |
| 배포 | Vercel |

## 로컬 실행

**사전 요구사항:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```
2. `.env.local` 파일을 생성하고 Gemini API 키 설정:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
