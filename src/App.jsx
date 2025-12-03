import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Briefcase, Shield, Zap, Calendar, Camera, Share2, ChevronRight, RefreshCw, Star, ArrowRight, AlertTriangle, Coins, Dices, Smile, Gamepad2, MessageCircle, Send, X } from 'lucide-react';

/**
 * 2026 럭키 유니버스 (Lucky Universe 2026) - Hanyang Univ. Project Ver.
 */

// --- Utility Functions ---

// 마크다운 제거 함수
const cleanMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim(); // trim 추가
};

// 운세 결과 카드 이미지 생성 함수
async function generateFortuneCardImage(fortuneData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 800;

    // 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#FFF5F7'); // 연한 핑크
    gradient.addColorStop(1, '#E0E7FF'); // 연한 블루
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);

    // 테두리
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 760);

    // 제목
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 50px "Malgun Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2026 럭키 유니버스', 400, 100);

    // 이모지 장식
    ctx.font = '60px serif';
    ctx.fillText('🔮', 150, 100);
    ctx.fillText('🍀', 650, 100);

    // 요약 텍스트
    ctx.font = 'bold 40px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#DB2777'; // 핑크색
    
    const words = fortuneData.summary.split(' ');
    let line = '';
    let y = 250;
    const maxWidth = 700;
    const lineHeight = 55;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 400, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 400, y);

    // 해시태그
    y += 100;
    ctx.font = '30px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#4B5563';
    ctx.fillText(fortuneData.hashtags.join('  '), 400, y);

    // 하단 문구
    ctx.font = '25px "Malgun Gothic", sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText('A project by Hanyang University students', 400, 750);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// SVG Data URL을 PNG Blob으로 변환
function svgDataURLToPngBlob(svgDataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024; 
            canvas.height = 1024;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF'; // 투명 배경 방지
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("PNG conversion failed."));
            }, 'image/png');
        };
        img.onerror = (e) => reject(new Error("Failed to load SVG image."));
        img.src = svgDataUrl;
    });
}

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
            initial: data.daily?.initial || "ㅅㅎ",
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

// --- API Calls (Client Side -> Serverless Endpoint) ---

// [추가됨] 서버리스 엔드포인트 호출 및 에러/재시도 처리 함수
async function callServerlessAPI(prompt, retryCount = 3) {
  let delay = 1000;

  for (let i = 0; i < retryCount; i++) {
    try {
      // Vercel 서버리스 엔드포인트 호출
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }) // fortune.js에서 req.body.prompt로 접근
      });

      if (response.status === 429 || response.status === 503) {
        // 503 (Service Unavailable/Model Overload) 발생 시에도 재시도
        console.warn(`API Error ${response.status} (Rate limit/Overload). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        // 서버리스 함수 내부에서 발생한 에러 메시지를 클라이언트에게 전달
        const errorData = await response.json();
        throw new Error(`Server Error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      // 서버리스 함수는 Gemini 응답 JSON을 그대로 전달함
      return await response.json();
    } catch (e) {
      console.error(`Attempt ${i+1} failed:`, e);
      if (i === retryCount - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.");
}


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
        - initial: 행운의 초성 2개 (반드시 2글자, 예: "ㄱㅎ").
    5. [오늘의 사랑 찾기] loveMatch:
        - charmScore: *오늘* 나의 도화살/매력도 점수 (0~100 숫자).
        - bestMbti: *오늘* 가장 잘 맞는 운명의 MBTI.
        - advice: *오늘*을 위한 연애 조언 및 데이트 팁.
    6. [2026 직업/재물] careerWealth:
        - jobs: 추천 직무명 3개.
        - workStyle: 업무 스타일 키워드.
        - salary: 2026년 재물운 예측 (중요: 사용자의 생년월일 ${userData.birthDate} 기준 나이에 맞는 현실적인 소득원(용돈, 알바비, 장학금, 월급 등)을 언급하며 1~2문장으로 간결하게 표현할 것).
        - hiddenSkill: 숨겨진 재능 1가지.
    7. [빌런 탐지기] villain: 2026년에 조심해야 할 사람 특징.
    8. [대박 캘린더] luckyDates: 2026년 중 가장 운이 좋은 날짜 3개.

    JSON Output Schema Example:
    {
      "summary": "...",
      "hashtags": ["...", "...", "..."],
      "details": { "wealth": "...", "love": "...", "career": "...", "health": "..." },
      "daily": { "todaySummary": "...", "score": 90, "mission": "...", "lotto": [1, 2, 3, 4, 5, 6], "initial": "ㅅㅎ" },
      "loveMatch": { "charmScore": 85, "bestMbti": "ENFP", "advice": "..." },
      "careerWealth": { "jobs": ["...", "...", "..."], "workStyle": "...", "salary": "...", "hiddenSkill": "..." },
      "villain": "...",
      "luckyDates": ["3월 5일", "7월 20일", "11월 11일"]
    }
  `;

    try {
        const data = await callServerlessAPI(prompt); // 서버리스 API 호출
        const textResponse = data.candidates[0].content.parts[0].text;
        return normalizeFortuneData(safeJSONParse(textResponse));

    } catch (error) {
        console.error("Full Fortune Generation Error:", error);
        // callServerlessAPI에서 throw한 에러를 여기서 catch하여 알림
        alert("앗! 지금 사용자가 너무 많아서 AI 점술가가 조금 바빠요! 🤯\n잠시 뒤에 다시 시도해 주시면 금방 봐드릴게요! 🍀");
        return null;
    }
}

// [무료 모드] 8비트 픽셀 아트(도트) 생성 함수 (SVG)
async function generateCutePixelArtSVG(description) {
    const svgPrompt = `
      Role: Expert Pixel Artist.
      Task: Create a CUTE, 8-BIT PIXEL ART SVG code for: "${description}".
      
      IMPORTANT INSTRUCTIONS:
      1. Use ONLY <rect> elements to create a pixel art look. Do NOT use <path>, <circle>, or <ellipse>.
      2. The art should look like a retro game sprite (Pokemon/Tamagotchi), 24x24 or 32x32 grid.
      3. Colors: Vibrant pastel colors + Black outline for contrast.
      4. ViewBox: "0 0 512 512" (scale up the pixels).
      5. Return **ONLY the raw <svg> string**. No markdown. No explanations.
    `; // [수정됨] SVG 포맷을 더 명확하게 강조

    try {
        const data = await callServerlessAPI(svgPrompt); // 서버리스 API 호출
        let svgCode = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) svgCode = svgMatch[0];
        else svgCode = svgCode.replace(/```xml|```svg|```/g, "").trim();

        if (!svgCode.startsWith('<svg')) {
             console.warn("SVG generation failed to return valid SVG. Using placeholder.");
             // 유효하지 않은 응답일 경우, 대체 SVG 플레이스홀더를 반환합니다.
             svgCode = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="512" height="512" fill="#cccccc"/><text x="256" y="270" font-size="60" fill="#000000" text-anchor="middle">👾</text><text x="256" y="340" font-size="20" fill="#000000" text-anchor="middle">Error: Image Gen Failed</text></svg>`;
        }

        const base64Svg = btoa(unescape(encodeURIComponent(svgCode)));
        return `data:image/svg+xml;base64,${base64Svg}`;

    } catch (e) {
        console.error("SVG Gen Error:", e);
        // API 호출 자체가 실패한 경우, 사용자에게 알림을 줍니다.
        alert("이미지 생성 서버 통신 오류! 잠시 후 다시 시도해주세요.");
        return null;
    }
}

async function generateLuckyIconImage(wish, userData) {
  
  try {
    const designPrompt = `
      Analyze MBTI: ${userData.mbti}, Wish: "${wish}".
      Select a CUTE ANIMAL (e.g., Rabbit, Bear, Cat).
      Describe it holding an object related to the wish.
      Output format: "A [Adjective] [Animal] [Action]"
    `;

    // 1. Text generation using serverless function
    const designData = await callServerlessAPI(designPrompt); // 서버리스 API 호출

    let characterDescription = "cute fluffy rabbit";
    const extractedText = designData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (extractedText) characterDescription = extractedText;

    // 2. SVG generation using the helper function (which also uses callServerlessAPI)
    const imageUrl = await generateCutePixelArtSVG(characterDescription);
    if (!imageUrl) throw new Error("Image Generation Failed");
    return imageUrl;

  } catch (error) {
    console.error("Icon Gen Error:", error);
    alert("앗! AI 화가님이 바쁜가 봐요! 🎨💦\n잠시 뒤에 다시 부탁해볼까요?");
    return null;
  }
}

// Gemini Chat Function
async function generateChatResponse(history, userData, fortuneSummary) {
  
  const systemPrompt = `
    You are 'Lucky Tamagotchi'.
    Info: MBTI=${userData.mbti}, Birth Date=${userData.birthDate}, Gender=${userData.gender}, Fortune Summary (2026)="${fortuneSummary}".
    Persona: Cute, informal Korean(Banmal), use emojis sparingly.
    You must naturally incorporate the user's MBTI, birth date, gender, and fortune summary into the conversation and advice.
    No Markdown formatting (bold, italic).
  `; // [수정됨] 사용자 요청 프롬프트로 변경

  // history를 포함하는 최종 프롬프트 구성
  const prompt = systemPrompt + "\n\nChat History:\n" + 
    history.map(msg => `${msg.role}: ${msg.text}`).join('\n') + 
    "\n\nTamagotchi's Response (ONLY plain text):"; 

  try {
    const data = await callServerlessAPI(prompt); // 서버리스 API 호출
    
    let responseText = data.candidates[0].content.parts[0].text;
    
    // 불필요한 JSON wrapper 제거 로직 (혹시 모를 상황 대비)
    const unwantedPrefix = /^{\s*["']?Tamagotchi["']?\s*:\s*["']?/;
    const unwantedSuffix = /["']?\s*,\s*}?$/;
    responseText = responseText.replace(unwantedPrefix, '').replace(unwantedSuffix, '').trim();

    return cleanMarkdown(responseText);

  } catch (error) {
    return "통신이 불안정해! 다시 말해줄래? 📡";
  }
}

// --- UI Components ---

const LoadingScreen = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-6 animate-pulse">
        <div className="relative w-24 h-24 font-mono text-4xl flex items-center justify-center">
            <div className="absolute animate-ping opacity-75 text-5xl">🐎</div>
            <div className="relative text-6xl z-10 animate-bounce">🍀</div>
        </div>
        <p className="text-pink-600 font-bold text-xl text-center font-mono bg-white border-2 border-black p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {message}
        </p>
        <p className="text-sm text-gray-500 font-mono">예상 대기 시간: 10~15초</p>
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
    const safeInitial = initial || "ㅅㅎ";

    const [isSpinning, setIsSpinning] = useState(false);
    const [displayNumbers, setDisplayNumbers] = useState(Array(6).fill("?"));
    const [displayInitial, setDisplayInitial] = useState(['?', '?']);

    const initialList = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const getRandomInitial = () => initialList[Math.floor(Math.random() * initialList.length)];
    
    useEffect(() => {
        setDisplayInitial(['?', '?']);
    }, []);

    const handleSpin = () => {
        setIsSpinning(true);
        let counter = 0;
        const finalInitial = (safeInitial + "  ").split('').slice(0, 2); 
        
        const interval = setInterval(() => {
            setDisplayNumbers(displayNumbers.map(() => Math.floor(Math.random() * 45) + 1));
            setDisplayInitial([getRandomInitial(), getRandomInitial()]);
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                setDisplayNumbers(safeNumbers);
                setDisplayInitial(finalInitial);
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
                        {num === '?' ? num : String(num).padStart(2, '0')}
                    </div>
                ))}
            </div>
             <div className="flex items-center justify-center justify-center gap-2 mb-4">
                <span className="font-bold">행운의 초성:</span>
                 {displayInitial.map((char, index) => (
                    <div key={index} className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {char}
                    </div>
                 ))}
             </div>
            <Button onClick={handleSpin} variant="secondary" disabled={isSpinning} className="py-2 text-lg">
                {isSpinning ? "돌아가는 중..." : "레버 당기기!"} <Dices className={isSpinning ? "animate-spin" : ""} />
            </Button>
        </div>
    );
}

const HomeView = ({ onStart }) => (
    <div className="flex flex-col items-center text-center space-y-8 animate-fade-in py-10">
        <div className="relative mb-4">
            <span className="absolute -top-8 -left-8 text-7xl animate-bounce" style={{animationDuration: '2s'}}>🐴</span>
            <span className="absolute -bottom-8 -right-8 text-7xl animate-bounce delay-150" style={{animationDuration: '2.5s'}}>💖</span>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 leading-none tracking-tighter filter drop-shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
    
    // [수정됨] 생년월일 입력 변경 핸들러
    const handleBirthDateChange = (e) => {
        const value = e.target.value;
        setUserData({...userData, birthDate: value});
    };

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
                            // max 속성을 사용하여 년도 입력을 제한 (브라우저 지원에 따라 다름)
                            max="9999-12-31" 
                            onChange={handleBirthDateChange}
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
    
    const handleShare = async () => {
        try {
            const blob = await generateFortuneCardImage(fortuneData);
            const file = new File([blob], "lucky_fortune_2026.png", { type: "image/png" });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: '2026 럭키 유니버스 🔮',
                    text: `✨ 나의 2026년 운세 키워드: ${fortuneData.hashtags.join(' ')}\n지금 바로 확인해보세요!`,
                    files: [file],
                    url: window.location.href
                });
            } else {
                // navigator.clipboard.writeText() 대신 document.execCommand('copy') 사용
                const el = document.createElement('textarea');
                el.value = window.location.href;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                alert("링크가 클립보드에 복사되었습니다! (이미지 공유 미지원 브라우저)");
            }
        } catch (err) {
            console.error("Share failed:", err);
            try {
                // navigator.clipboard.writeText() 대신 document.execCommand('copy') 사용
                const el = document.createElement('textarea');
                el.value = window.location.href;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                alert("공유 중 오류가 발생하여 링크가 복사되었습니다.");
            } catch (e) {
                alert("공유 기능을 사용할 수 없습니다.");
            }
        }
    };

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
                        <p className="text-lg font-bold text-blue-800 leading-relaxed break-keep text-left mt-2">
                            {fortuneData.careerWealth?.salary || "측정 불가"}
                        </p>
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex-1 bg-white p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <h5 className="font-bold text-xs text-gray-500 mb-2">나의 업무 스타일</h5>
                            <p className="font-bold text-blue-800">{fortuneData.careerWealth?.workStyle || "열정적"}</p>
                        </div>
                         <div className="flex-1 bg-white p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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

                <Card title="📅 대박 캘린더 (황금 말발굽일)" icon={<Calendar className="text-yellow-600 fill-current"/>} className="bg-yellow-100 border-yellow-500">
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
                <Button onClick={onTalismanStart} variant="secondary" className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4">
                    <Gamepad2 className="w-6 h-6 animate-bounce" /> 2026 나만의 럭키 다마고치 만들기
                </Button>
                <div className="flex gap-3">
                    <Button onClick={handleShare} variant="outline" className="flex-1">
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

const ChatView = ({ messages, onSendMessage, onBack }) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className="w-full max-w-md h-[80vh] flex flex-col bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-fade-in">
             {/* Header */}
            <div className="bg-yellow-100 border-b-4 border-black p-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-lg">럭키 다마고치 채팅방</span>
                 </div>
                 <button onClick={onBack} className="p-1 hover:bg-red-200 rounded-full transition-colors">
                     <X className="w-6 h-6" />
                 </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl font-medium text-sm shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-white border-2 border-black text-black rounded-tr-none' 
                            : 'bg-purple-500 text-white border-2 border-black rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t-4 border-black">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="다마고치에게 말 걸기..."
                    />
                    <button onClick={handleSend} className="bg-purple-500 text-white p-3 rounded-xl border-2 border-black hover:bg-purple-600 transition-transform active:scale-95">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const TalismanResultView = ({ image, userData, fortuneData, onReset, onBack, onChatStart }) => {
    // 이미지 저장 오류 해결 (Canvas 활용하여 PNG 변환 후 저장)
    const handleDownload = async () => {
        try {
            const blob = await svgDataURLToPngBlob(image);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lucky_tamagotchi_${new Date().getTime()}.png`; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            alert("이미지 자동 저장이 차단되었습니다. 이미지를 길게 눌러서 저장해주세요! 📸");
        }
    };

    return (
        <div className="w-full max-w-md animate-fade-in space-y-6 py-10">
            <Card className="bg-yellow-50 border-yellow-400 relative overflow-visible mt-8">
                <div className="absolute -top-6 -left-6 text-5xl animate-bounce">🧧</div>
                <div className="absolute -top-6 -right-6 text-5xl animate-bounce delay-100">✨</div>
                <h2 className="text-2xl font-black text-center mb-4">나만의 2026 럭키 다마고치</h2>
                <div className="border-4 border-black p-4 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 flex items-center justify-center">
                    {/* [수정됨] image가 null인 경우에도 플레이스홀더가 보이도록 처리 */}
                    {image ? (
                        <img src={image} alt="Generated Lucky Tamagotchi" className="w-full rounded-xl h-auto" style={{aspectRatio: '1/1', objectFit: 'contain'}} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-center text-gray-500 font-bold p-8" style={{aspectRatio: '1/1'}}>
                            이미지 생성 실패! 🥹<br/>다시 시도해 주세요.
                        </div>
                    )}
                </div>
                <p className="text-center text-sm font-bold text-gray-500 mt-4 font-mono">
                    * 당신의 MBTI({userData.mbti})와 소원을 담은 럭키 다마고치예요!<br/>
                    (프로필 사진이나 배경화면으로 딱이죠? 😉)
                </p>
                 
                 <div className="flex flex-col gap-3 mt-6">
                    <Button onClick={onChatStart} variant="secondary" className="w-full" disabled={!fortuneData}>
                        <MessageCircle className="w-5 h-5" /> 다마고치랑 대화하기
                    </Button>
                    
                    <div className="flex gap-3">
                        <Button onClick={handleDownload} variant="primary" className="flex-1" disabled={!image}>
                        <Camera className="w-5 h-5" /> 이미지 저장
                        </Button>
                        <Button onClick={onReset} variant="outline" className="flex-1">
                        새로 만들기
                        </Button>
                    </div>
                </div>

                 <button onClick={onBack} className="w-full text-center text-gray-500 underline font-bold mt-4">
                    운세 결과로 돌아가기
                </button>
            </Card>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const [view, setView] = useState('home');
    const [userData, setUserData] = useState({ birthDate: '', time: '', gender: 'female', mbti: 'ENFP' });
    const [fortuneData, setFortuneData] = useState(null);
    const [talismanWish, setTalismanWish] = useState('');
    const [talismanImage, setTalismanImage] = useState(null);
    const [chatMessages, setChatMessages] = useState([]); // Chat State

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
            // SVG 로딩 대기 (깜빡임 방지)
            setTalismanImage(imageUrl);
            setView('talismanResult');
        } else {
            // 이미지 생성 실패 시, 다시 입력 화면으로 돌아가거나 오류 메시지 표시
            setTalismanImage(null); // 실패 시 이미지 초기화
            setView('talismanResult'); // 플레이스홀더를 보기 위해 결과 화면으로 이동
        }
    };

    // Chat Handler (cleanMarkdown 적용)
    const handleSendMessage = async (text) => {
        const newUserMsg = { role: 'user', text };
        setChatMessages(prev => [...prev, newUserMsg]);

        // 사용자 정보와 운세 요약을 함께 전달하여 AI가 사주를 기억하고 대화에 활용하도록 합니다.
        const aiResponse = await generateChatResponse([...chatMessages, newUserMsg], userData, fortuneData?.summary);
        
        setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    };

    const handleChatStart = () => {
        setChatMessages([{ role: 'model', text: `안녕! 나는 너의 2026년 행운을 지켜줄 럭키 다마고치야! 🍀 궁금한 게 있거나 힘든 일이 있으면 뭐든 말해줘! (너의 MBTI가 ${userData.mbti}라며? 우리 잘 맞겠다! ✨)` }]);
        setView('chat');
    };

    return (
        <div className="min-h-screen bg-cover bg-center text-black font-sans flex items-center justify-center p-4 overflow-x-hidden" 
             style={{backgroundImage: 'linear-gradient(rgba(240, 240, 255, 0.8), rgba(240, 240, 255, 0.8)), url("[https://www.transparenttextures.com/patterns/cubes.png](https://www.transparenttextures.com/patterns/cubes.png)")'}}>
            <div className="w-full max-w-md">
                <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b-4 border-black px-4 py-3 flex justify-between items-center shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <span className="font-black font-mono text-xl">LUCKY 2026</span>
                    <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded-md font-bold border-2 border-black">한양</span>
                </header>

                <div className="pt-16 lg:pt-0 pb-10">
                    {view === 'home' && <HomeView onStart={handleStart} />}
                    {view === 'input' && <InputView userData={userData} setUserData={setUserData} onSubmit={handleSubmit} />}
                    {view === 'loading' && <LoadingScreen message="우주의 기운을 모아 2026년을 분석 중..." />}
                    {view === 'result' && <ResultView fortuneData={fortuneData} setView={setView} onTalismanStart={() => setView('talismanInput')} />}
                    {view === 'talismanInput' && <TalismanInputView wish={talismanWish} setWish={setTalismanWish} onGenerate={handleTalismanGen} onBack={() => setView('result')} />}
                    {view === 'talismanLoading' && <LoadingScreen message="귀여운 럭키 다마고치를 소환하는 중..." />}
                    {view === 'talismanResult' && <TalismanResultView image={talismanImage} userData={userData} fortuneData={fortuneData} onReset={() => {setTalismanImage(null); setView('talismanInput');}} onBack={() => setView('result')} onChatStart={handleChatStart} />}
                    {view === 'chat' && <ChatView messages={chatMessages} onSendMessage={handleSendMessage} onBack={() => setView('talismanResult')} />}
                </div>

                {view !== 'home' && view !== 'chat' && (
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