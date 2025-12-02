import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Briefcase, Shield, Zap, Calendar, Camera, Share2, ChevronRight, RefreshCw, Star, ArrowRight, AlertTriangle, Coins, Dices, Smile, Gamepad2 } from 'lucide-react';

/**
 * 2026 럭키 유니버스 (Lucky Universe 2026) - Hanyang Univ. Project Ver.
 */

// --- API Service Configuration ---
// [중요] 깃허브 배포 및 로컬 실행 시에는 아래 주석을 풀고 사용하세요!
const apiKey = import.meta.env.VITE_API_KEY;
//const apiKey = ""; // 현재 미리보기 환경을 위해 임시로 비워둡니다. (자동 주입)

// --- API Functions ---

const safeJSONParse = (jsonString) => {
  try {
    const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

const normalizeFortuneData = (data) => {
  if (!data) return null;
  return {
    summary: data.summary || "2026년은 당신의 해가 될 거예요!",
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : ["#행운가득", "#적토마", "#대박"],
    details: {
      wealth: typeof data.details?.wealth === 'string' ? data.details.wealth : "재물운이 상승하는 시기입니다.",
      love: typeof data.details?.love === 'string' ? data.details.love : "사랑이 꽃피는 한 해가 될 거예요.",
      career: typeof data.details?.career === 'string' ? data.details.career : "능력을 인정받는 기회가 찾아옵니다.",
      health: typeof data.details?.health === 'string' ? data.details.health : "건강 관리에 유의하면 활기찬 한 해가 됩니다.",
    },
    daily: {
      todaySummary: data.daily?.todaySummary || "오늘은 기분 좋은 일이 생길 것 같아요!", 
      score: typeof data.daily?.score === 'number' ? data.daily.score : 80,
      mission: data.daily?.mission || "하늘 한번 쳐다보고 크게 웃기",
      lotto: Array.isArray(data.daily?.lotto) ? data.daily.lotto : [1, 7, 15, 23, 34, 42],
      initial: data.daily?.initial || "ㅎ",
    },
    loveMatch: {
      charmScore: typeof data.loveMatch?.charmScore === 'number' ? data.loveMatch.charmScore : 85,
      bestMbti: data.loveMatch?.bestMbti || "ENFP",
      advice: data.loveMatch?.advice || "자신감 있게 다가가세요!",
    },
    careerWealth: {
      jobs: Array.isArray(data.careerWealth?.jobs) ? data.careerWealth.jobs : ["크리에이터", "CEO", "기획자"],
      workStyle: data.careerWealth?.workStyle || "열정적인 리더형",
      salary: data.careerWealth?.salary || "예측 불가 대박!",
      hiddenSkill: data.careerWealth?.hiddenSkill || "분위기 메이커",
    },
    villain: data.villain || "부정적인 에너지를 주는 사람을 조심하세요.",
    luckyDates: Array.isArray(data.luckyDates) ? data.luckyDates : ["1월 1일", "5월 5일", "12월 25일"]
  };
};

async function generateFullFortune(userData) {
  const prompt = `
    역할: 30년 경력의 명리학자이자 MZ세대 멘토인 AI 점술가.
    임무: 2026년(병오년, 적토마의 해) 종합 운세, '오늘'의 운세, '오늘'의 연애운 분석.
    사용자 정보: ${userData.birthDate}생, 태어난 시간 ${userData.time || '모름'}, 성별 ${userData.gender}, MBTI ${userData.mbti}.
    톤앤매너: 키치하고 귀여운 말투(해요체), 이모지 적극 활용, 위트 있는 비유.

    요청사항: 다음 항목들을 모두 분석하여 반드시 유효한 JSON 형식으로만 응답해주세요.
    
    1. [2026 종합 요약] summary: 2026년 총운을 위트 있는 한 문장으로 요약.
    2. [해시태그] hashtags: 핵심 키워드 해시태그 3개.
    3. [2026 상세 운세] details: 재물(wealth), 애정(love), 직업(career), 건강(health) 4가지 분야별 조언.
    4. [오늘의 운세 게임] daily:
       - todaySummary: 오늘 하루의 운세를 나타내는 짧고 굵은 한마디.
       - score: 오늘의 운세 점수 (0~100 숫자).
       - mission: 오늘 실천할 행운의 미션 1가지.
       - lotto: 행운의 로또 번호 6개.
       - initial: 행운의 초성 1개.
    5. [오늘의 사랑 찾기] loveMatch:
       - charmScore: *오늘* 나의 도화살/매력도 점수 (0~100 숫자).
       - bestMbti: *오늘* 가장 잘 맞는 운명의 MBTI.
       - advice: *오늘*을 위한 연애 조언 및 데이트 팁.
    6. [2026 직업/재물] careerWealth:
       - jobs: 추천 직무명 3개.
       - workStyle: 업무 스타일 키워드.
       - salary: 2026년 예상 수입 (재미로, 예: "월 500 + α").
       - hiddenSkill: 숨겨진 재능 1가지.
    7. [빌런 탐지기] villain: 2026년에 조심해야 할 사람 특징.
    8. [대박 캘린더] luckyDates: 2026년 중 가장 운이 좋은 날짜 3개.

    JSON Output Schema Example:
    {
      "summary": "...",
      "hashtags": ["...", "...", "..."],
      "details": { "wealth": "...", "love": "...", "career": "...", "health": "..." },
      "daily": { "todaySummary": "...", "score": 90, "mission": "...", "lotto": [1, 2, 3, 4, 5, 6], "initial": "김" },
      "loveMatch": { "charmScore": 85, "bestMbti": "ENFP", "advice": "..." },
      "careerWealth": { "jobs": ["...", "...", "..."], "workStyle": "...", "salary": "...", "hiddenSkill": "..." },
      "villain": "...",
      "luckyDates": ["3월 5일", "7월 20일", "11월 11일"]
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Fortune API Error Details:", errorText);
        throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("API Response Structure Error:", data);
        throw new Error("Invalid API response");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    const rawData = safeJSONParse(textResponse);
    return normalizeFortuneData(rawData);

  } catch (error) {
    console.error("Fortune API Error", error);
    alert("운세 데이터를 받아오는데 실패했습니다. (API Error) 잠시 후 다시 시도해주세요.");
    return null;
  }
}

async function generateCuteSVG(description) {
    const svgPrompt = `
      Role: Expert Pixel Artist.
      Task: Create a CUTE, 8-BIT PIXEL ART SVG code for: "${description}".
      
      IMPORTANT INSTRUCTIONS:
      1. Use ONLY <rect> elements to create a pixel art look. Do NOT use <path>, <circle>, or <ellipse>.
      2. The art should look like a retro game sprite (e.g., Pokemon, Tamagotchi style).
      3. Grid size: roughly 24x24 or 32x32 pixels.
      4. Colors: Vibrant pastel colors + Black outline for contrast.
      5. Background: Transparent or simple solid color.
      6. ViewBox: "0 0 512 512" (scale up the pixels).
      7. Return ONLY the raw <svg> string. No markdown. No explanations.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: svgPrompt }] }] })
        });

        if (!response.ok) throw new Error("SVG Gen Failed");
        const data = await response.json();
        let svgCode = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
            svgCode = svgMatch[0];
        } else {
            svgCode = svgCode.replace(/```xml|```svg|```/g, "").trim();
        }

        const base64Svg = btoa(unescape(encodeURIComponent(svgCode)));
        return `data:image/svg+xml;base64,${base64Svg}`;

    } catch (e) {
        console.error("SVG Fallback Error:", e);
        return null;
    }
}

async function generateLuckyIconImage(wish, userData) {
  let characterDescription = "A cute fluffy rabbit smiling happily";

  try {
    const designPrompt = `
      Analyze the user's MBTI (${userData.mbti}) and Wish ("${wish}").
      Select a CUTE ANIMAL (avoiding common ones if possible).
      Example: INFP->Rabbit, ENTJ->Lion, ENFP->Quokka.
      Describe the character performing an action related to "${wish}".
      Output format: "A [Adjective] [Animal] [Action]"
    `;

    const designResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: designPrompt }] }] })
    });

    if (designResponse.ok) {
        const designData = await designResponse.json();
        const extractedText = designData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (extractedText) characterDescription = extractedText;
    }

    const prompt = `
      Role: Kawaii Illustrator. Goal: Create a cute 2D sticker.
      Subject: ${characterDescription}.
      Style: Sanrio-style, pastel flat colors, simple vector art.
      Constraint: NO TEXT. White background.
    `;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt: prompt }], parameters: { sampleCount: 1, aspectRatio: "1:1" } })
    });

    if (!response.ok) {
        console.warn("Imagen API unavailable (likely billing). Switching to Free SVG Mode.");
        const svgDataUrl = await generateCuteSVG(characterDescription);
        if (svgDataUrl) return svgDataUrl;
        
        throw new Error("이미지 생성 실패 (유료 모델 및 무료 모드 모두 실패)");
    }

    const data = await response.json();
    if (data.predictions && data.predictions[0]) {
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }
    throw new Error("No image data");

  } catch (error) {
    console.error("Final Icon Gen Error:", error);
    const fallback = await generateCuteSVG(characterDescription);
    if(fallback) return fallback;

    alert("이미지 생성 서버가 혼잡하거나 권한이 없습니다. 잠시 후 다시 시도해주세요.");
    return null;
  }
}

// --- UI Components (Defined Outside App) ---

const LoadingScreen = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-6 animate-pulse">
    <div className="relative w-24 h-24 font-mono text-4xl flex items-center justify-center">
        <div className="absolute animate-ping opacity-75 text-5xl">🐎</div>
        <div className="relative text-6xl z-10 animate-bounce">🍀</div>
    </div>
    <p className="text-pink-600 font-bold text-xl text-center font-mono bg-white border-2 border-black p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {message}
    </p>
    <p className="text-sm text-gray-500 font-mono">약 5~10초 정도 걸려요!</p>
  </div>
);

const Card = ({ children, className = "", title, icon }) => (
  <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden ${className}`}>
    {(title || icon) && (
        <div className="bg-gray-100 border-b-2 border-black p-3 flex items-center gap-2 font-bold text-lg">
            {icon}
            <span>{title}</span>
        </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const ProgressBar = ({ score, colorClass }) => (
  <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-black overflow-hidden relative">
    <div 
      className={`h-full ${colorClass} transition-all duration-1000 ease-out flex items-center justify-end pr-2 font-bold font-mono text-sm border-r-2 border-black`}
      style={{ width: `${score}%` }}
    >
      {score}%
    </div>
  </div>
);

const Button = ({ onClick, children, variant = "primary", disabled = false, className="" }) => {
  const baseStyle = `w-full py-4 font-bold text-xl rounded-xl border-2 border-black transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`;
  const variants = {
    primary: "bg-pink-400 hover:bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    secondary: "bg-yellow-300 hover:bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    outline: "bg-white hover:bg-gray-50 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]}`}>
      {children}
    </button>
  );
};

const SlotMachine = ({ numbers, initial }) => {
    const safeNumbers = Array.isArray(numbers) ? numbers : [1, 2, 3, 4, 5, 6];
    const safeInitial = initial || "?";

    const [isSpinning, setIsSpinning] = useState(false);
    const [displayNumbers, setDisplayNumbers] = useState(Array(6).fill("?"));
    const [displayInitial, setDisplayInitial] = useState("?");

    const handleSpin = () => {
        setIsSpinning(true);
        let counter = 0;
        const interval = setInterval(() => {
            setDisplayNumbers(displayNumbers.map(() => Math.floor(Math.random() * 45) + 1));
            setDisplayInitial(["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"][Math.floor(Math.random() * 14)]);
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                setDisplayNumbers(safeNumbers);
                setDisplayInitial(safeInitial);
                setIsSpinning(false);
            }
        }, 100);
    };

    return (
        <div className="text-center bg-indigo-50 p-4 rounded-xl border-2 border-black">
            <h4 className="font-bold mb-4 flex items-center justify-center gap-2">🎰 오늘의 행운 슬롯 🎰</h4>
            <div className="flex justify-center gap-2 mb-4">
                {displayNumbers.map((num, idx) => (
                    <div key={idx} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {num}
                    </div>
                ))}
            </div>
             <div className="flex items-center justify-center gap-2 mb-4">
                <span className="font-bold">행운의 초성:</span>
                 <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {displayInitial}
                </div>
             </div>
            <Button onClick={handleSpin} variant="secondary" disabled={isSpinning} className="py-2 text-lg">
                {isSpinning ? "돌아가는 중..." : "레버 당기기!"} <Dices className={isSpinning ? "animate-spin" : ""} />
            </Button>
        </div>
    );
}

// --- View Components (Extracted) ---

const HomeView = ({ onStart }) => (
  <div className="flex flex-col items-center text-center space-y-8 animate-fade-in py-10">
    <div className="relative mb-4">
      <span className="absolute -top-8 -left-8 text-7xl animate-bounce" style={{animationDuration: '2s'}}>🐴</span>
      <span className="absolute -bottom-8 -right-8 text-7xl animate-bounce delay-150" style={{animationDuration: '2.5s'}}>💖</span>
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 leading-none tracking-tighter filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        2026<br/>LUCKY<br/>UNIVERSE
      </h1>
    </div>
    <p className="text-xl font-bold text-black bg-white px-6 py-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
      병오년 적토마 x MBTI 초개인화 운세
    </p>
    <div className="w-full max-w-xs space-y-4 mt-8">
      <Button onClick={onStart} variant="primary">
        <Sparkles className="w-6 h-6 animate-pulse" /> 운세 start!
      </Button>
      <p className="text-sm font-bold font-mono text-gray-500">Powered by Latest Google AI Model</p>
    </div>
  </div>
);

const InputView = ({ userData, setUserData, onSubmit }) => {
  const mbtiList = ["ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"];
  return (
    <div className="w-full max-w-md animate-fade-in py-6">
      <Card title="정보를 입력해줘! 📝">
        <div className="space-y-5 font-mono">
          <div>
            <label className="block font-bold mb-2 text-lg">🎂 생년월일</label>
            <input 
              type="date" 
              className="w-full p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-300 text-lg"
              value={userData.birthDate}
              onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-bold mb-2 text-lg">⏰ 태어난 시간 (선택)</label>
            <input 
              type="time" 
              className="w-full p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-300 text-lg"
              value={userData.time}
              onChange={(e) => setUserData({...userData, time: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-bold mb-2 text-lg">🧩 MBTI</label>
            <select 
              className="w-full p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-300 text-lg appearance-none bg-white"
              value={userData.mbti}
              onChange={(e) => setUserData({...userData, mbti: e.target.value})}
              style={{backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%23000000%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2087.2c0%205%201.8%209.3%205.4%2013l131.3%20131.3c3.6%203.6%207.9%205.4%2013%205.4s9.3-1.8%2013-5.4L287%20100.2c3.6-3.6%205.4-7.9%205.4-13%200-5-1.8-9.3-5.4-13z%27%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto'}}
            >
              {mbtiList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-2 text-lg">⚧️ 성별</label>
            <div className="flex gap-3">
              {['female', 'male'].map(g => (
                <button
                  key={g}
                  onClick={() => setUserData({...userData, gender: g})}
                  className={`flex-1 py-3 rounded-xl border-2 border-black font-bold text-lg transition-all ${
                    userData.gender === g ? 'bg-indigo-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-1' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {g === 'female' ? '여성' : '남성'}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={onSubmit}>
                운세 분석 시작 <ArrowRight className="w-6 h-6 animate-pulse" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ResultView = ({ fortuneData, setView, onTalismanStart }) => {
  if (!fortuneData) return <div className="p-10 text-center font-bold">데이터 오류</div>;
  
  return (
    <div className="w-full max-w-md animate-slide-up space-y-8 pb-12 pt-6">
      <Card className="bg-gradient-to-br from-pink-100 via-yellow-50 to-indigo-100 relative overflow-visible mt-8">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-6xl filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">🔮</div>
        <h2 className="text-3xl font-black text-center mb-4 text-indigo-900 mt-6">2026 나의 운세</h2>
        <p className="text-center text-2xl font-bold text-pink-600 mb-6 break-keep leading-relaxed bg-white/50 p-4 rounded-xl border-2 border-black">
          "{fortuneData.summary}"
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.isArray(fortuneData.hashtags) && fortuneData.hashtags.map(tag => (
            <span key={tag} className="bg-white border-2 border-black px-4 py-2 rounded-full text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />{tag}
            </span>
          ))}
        </div>
      </Card>
      
      <Card title="오늘의 운세 & 미션 🎮" icon={<Dices className="text-purple-500"/>} className="bg-purple-50">
        <div className="space-y-6">
            <div className="bg-white p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-bold text-sm text-gray-500 mb-1">오늘의 한마디</h4>
                <p className="font-bold text-purple-700 text-lg">"{fortuneData.daily?.todaySummary}"</p>
            </div>
            <div>
                <div className="flex justify-between font-bold mb-2">
                    <span>오늘의 행운 점수</span>
                    <span className="text-purple-600">{fortuneData.daily?.score || 0}점!</span>
                </div>
                <ProgressBar score={fortuneData.daily?.score || 0} colorClass="bg-purple-400" />
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-black flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl">✨</span>
                <div>
                    <h4 className="font-bold text-purple-900 mb-1">오늘의 행운 미션</h4>
                    <p className="font-medium">{fortuneData.daily?.mission || "오늘 하루 즐겁게 보내기!"}</p>
                </div>
            </div>
            <SlotMachine numbers={fortuneData.daily?.lotto} initial={fortuneData.daily?.initial} />
        </div>
      </Card>

      <Card title="오늘 내 사랑 반쪽 찾기 💘" icon={<Heart className="text-pink-500 fill-current"/>} className="bg-pink-50">
        <div className="space-y-6">
            <div>
                <div className="flex justify-between font-bold mb-2">
                    <span>오늘 나의 도화살/매력도</span>
                    <span className="text-pink-600">{fortuneData.loveMatch?.charmScore || 50}%</span>
                </div>
                <ProgressBar score={fortuneData.loveMatch?.charmScore || 50} colorClass="bg-pink-400" />
            </div>
            <div className="flex gap-4">
                <div className="flex-1 bg-white p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-xs text-gray-500 font-bold mb-1">오늘 운명의 MBTI</div>
                    <div className="text-2xl font-black text-pink-500">{fortuneData.loveMatch?.bestMbti || "Secret"}</div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-bold text-pink-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4"/> 오늘의 러브 팁 & 데이트 치트키</h4>
                <p className="font-medium text-sm leading-relaxed">{fortuneData.loveMatch?.advice || "자신감을 가지세요!"}</p>
            </div>
        </div>
      </Card>

      <Card title="직업 & 재물 리포트 💰" icon={<Briefcase className="text-blue-500 fill-current"/>} className="bg-blue-50">
        <div className="space-y-5 font-mono">
             <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Star className="w-4 h-4"/> 2026년 예상 수입 (재미로!)</h4>
                <p className="text-2xl font-black text-right text-blue-600">{fortuneData.careerWealth?.salary || "측정 불가"}</p>
            </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h5 className="font-bold text-xs text-gray-500 mb-2">나의 업무 스타일</h5>
                    <p className="font-bold text-blue-800">{fortuneData.careerWealth?.workStyle || "열정적"}</p>
                </div>
                 <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h5 className="font-bold text-xs text-gray-500 mb-2">숨겨진 재능 발견</h5>
                    <p className="font-bold text-blue-800">{fortuneData.careerWealth?.hiddenSkill || "리더십"}</p>
                </div>
             </div>
             <div>
                <h5 className="font-bold mb-2">추천 천직 Best 3</h5>
                <ul className="flex flex-wrap gap-2">
                    {Array.isArray(fortuneData.careerWealth?.jobs) && fortuneData.careerWealth.jobs.map((job, idx) => (
                        <li key={idx} className="bg-blue-100 border-2 border-blue-300 px-3 py-1 rounded-lg font-bold text-sm">{job}</li>
                    ))}
                </ul>
             </div>
        </div>
      </Card>

      <Card title="2026 4대 운세 심층 분석 📜" icon={<RefreshCw className="text-green-500"/>} className="bg-green-50">
        <div className="space-y-4 divide-y-2 divide-black/10">
        {[
          { icon: <Coins className="text-yellow-500" />, title: "재물운", content: fortuneData.details?.wealth },
          { icon: <Heart className="text-pink-500" />, title: "애정운", content: fortuneData.details?.love },
          { icon: <Briefcase className="text-blue-500" />, title: "직업운", content: fortuneData.details?.career },
          { icon: <Shield className="text-green-500" />, title: "건강운", content: fortuneData.details?.health },
        ].map((item, idx) => (
          <div key={idx} className="pt-4 first:pt-0">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <h3 className="font-bold text-lg">{item.title}</h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-line text-justify">
                {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
            </p>
          </div>
        ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-red-100 border-red-500" title="🚨 2026 빌런 경보!" icon={<AlertTriangle className="text-red-500 fill-current"/>}>
            <p className="font-bold text-red-800 leading-relaxed">
                "{fortuneData.villain}"
            </p>
            <p className="text-xs text-red-500 mt-2 text-right font-bold">※ 이런 특징이 보이면 도망가세요!</p>
        </Card>

        <Card className="bg-yellow-100 border-yellow-500" title="📅 대박 캘린더 (황금 말발굽일)" icon={<Calendar className="text-yellow-600 fill-current"/>}>
            <div className="flex justify-around items-center">
                {Array.isArray(fortuneData.luckyDates) && fortuneData.luckyDates.map((date, idx) => (
                    <div key={idx} className="text-center relative">
                         <span className="absolute -top-3 -left-2 text-2xl">🐴</span>
                        <div className="bg-white border-2 border-yellow-500 rounded-lg p-3 font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                            {date}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      <div className="space-y-4 pt-4 sticky bottom-4 z-10">
        {/* UPDATED: 버튼 텍스트 변경 */}
        <Button onClick={onTalismanStart} variant="secondary" className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4">
          <Gamepad2 className="w-6 h-6 animate-bounce" /> 2026 나만의 럭키 다마고치 만들기
        </Button>
        <div className="flex gap-3">
            <Button onClick={() => alert("스크린샷을 찍어 인스타 스토리에 공유해보세요!")} variant="outline" className="flex-1">
            <Share2 className="w-5 h-5" /> 공유하기
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 bg-gray-200">
            <RefreshCw className="w-5 h-5" /> 처음으로
            </Button>
        </div>
      </div>
    </div>
  );
};

const TalismanInputView = ({ wish, setWish, onGenerate, onBack }) => (
  <div className="w-full max-w-md animate-fade-in space-y-6 py-10">
    {/* UPDATED: 카드 제목 및 설명, 버튼 텍스트 변경 */}
    <Card title="2026 럭키 다마고치 연구소 👾" icon={<Gamepad2 className="text-yellow-500 fill-current"/>} className="bg-yellow-50">
      <p className="text-center font-bold text-lg mb-2">2026년 꼭 이루고 싶은 소원은?</p>
      <p className="text-center text-gray-500 text-sm mb-6 font-mono">MBTI와 소원에 찰떡인 나만의 럭키 다마고치를 그려드려요! 👾✨</p>
      <div className="space-y-5">
        <textarea
            className="w-full p-4 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 min-h-[150px] text-lg font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            placeholder="예: 멋진 곳으로 이직! 로또 1등! 연애 성공!"
            value={wish}
            onChange={(e) => setWish(e.target.value)}
        />
        <Button onClick={onGenerate} variant="secondary" className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 h-16 text-2xl">
            럭키 다마고치 생성 (Click!) 👾
        </Button>
        <button onClick={onBack} className="w-full text-center text-gray-500 underline font-bold">
            뒤로 가기
        </button>
      </div>
    </Card>
  </div>
);

const TalismanResultView = ({ image, userData, onReset, onBack }) => (
  <div className="w-full max-w-md animate-fade-in space-y-6 py-10">
      <Card className="bg-yellow-50 border-yellow-400 relative overflow-visible mt-8">
          <div className="absolute -top-6 -left-6 text-5xl animate-bounce">🧧</div>
          <div className="absolute -top-6 -right-6 text-5xl animate-bounce delay-100">✨</div>
          {/* UPDATED: 결과 화면 제목 변경 */}
          <h2 className="text-2xl font-black text-center mb-4">나만의 2026 럭키 다마고치</h2>
          <div className="border-4 border-black p-4 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 flex items-center justify-center">
              <img src={image} alt="Generated Lucky Tamagotchi" className="w-full rounded-xl h-auto" style={{aspectRatio: '1/1', objectFit: 'contain'}} />
          </div>
          {/* UPDATED: 설명 문구 변경 */}
          <p className="text-center text-sm font-bold text-gray-500 mt-4 font-mono">
              * 당신의 MBTI({userData.mbti})와 소원을 담은 럭키 다마고치예요!<br/>
              (프로필 사진이나 배경화면으로 딱이죠? 😉)
          </p>
           <div className="flex gap-3 mt-6">
            <Button onClick={() => alert("이미지를 길게 눌러 저장하세요!")} variant="primary" className="flex-1">
               <Camera className="w-5 h-5" /> 이미지 저장
            </Button>
            <Button onClick={onReset} variant="outline" className="flex-1">
               새로 만들기
            </Button>
          </div>
           <button onClick={onBack} className="w-full text-center text-gray-500 underline font-bold mt-4">
              운세 결과로 돌아가기
          </button>
      </Card>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState('home');
  const [userData, setUserData] = useState({ birthDate: '', time: '', gender: 'female', mbti: 'ENFP' });
  const [fortuneData, setFortuneData] = useState(null);
  const [talismanWish, setTalismanWish] = useState('');
  const [talismanImage, setTalismanImage] = useState(null);

  const handleStart = () => setView('input');

  const handleSubmit = async () => {
    if (!userData.birthDate) return alert("생년월일을 입력해주세요!");
    setView('loading');
    const result = await generateFullFortune(userData);
    if (result) {
        setFortuneData(result);
        setView('result');
    } else {
        setView('input');
    }
  };

  const handleTalismanGen = async () => {
    if (!talismanWish) return alert("소원을 입력해주세요!");
    setView('talismanLoading');
    const imageUrl = await generateLuckyIconImage(talismanWish, userData);
    if (imageUrl) {
        setTalismanImage(imageUrl);
        setView('talismanResult');
    } else {
        setView('talismanInput');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-black font-sans flex items-center justify-center p-4 overflow-x-hidden" style={{backgroundImage: 'linear-gradient(rgba(240, 240, 255, 0.8), rgba(240, 240, 255, 0.8)), url("[https://www.transparenttextures.com/patterns/cubes.png](https://www.transparenttextures.com/patterns/cubes.png)")'}}>
      <div className="w-full max-w-md">
        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b-4 border-black px-4 py-3 flex justify-between items-center lg:hidden shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <span className="font-black font-mono text-xl">LUCKY '26</span>
          <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded-md font-bold border-2 border-black">FULL ver.</span>
        </header>

        <div className="pt-16 lg:pt-0 pb-10">
          {view === 'home' && <HomeView onStart={handleStart} />}
          {view === 'input' && <InputView userData={userData} setUserData={setUserData} onSubmit={handleSubmit} />}
          {view === 'loading' && <LoadingScreen message="우주의 기운을 모아 2026년을 분석 중..." />}
          {view === 'result' && <ResultView fortuneData={fortuneData} setView={setView} onTalismanStart={() => setView('talismanInput')} />}
          {view === 'talismanInput' && <TalismanInputView wish={talismanWish} setWish={setTalismanWish} onGenerate={handleTalismanGen} onBack={() => setView('result')} />}
          {/* UPDATED: 로딩 메시지 변경 */}
          {view === 'talismanLoading' && <LoadingScreen message="귀여운 럭키 다마고치를 소환하는 중..." />}
          {view === 'talismanResult' && <TalismanResultView image={talismanImage} userData={userData} onReset={() => {setTalismanImage(null); setView('talismanInput');}} onBack={() => setView('result')} />}
        </div>

        {view !== 'home' && (
          <footer className="mt-10 py-6 text-center flex flex-col items-center justify-center opacity-70">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-600">
                A project by Hanyang University students
              </span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}