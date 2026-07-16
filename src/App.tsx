import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Compass, 
  Sun, 
  CloudSun, 
  Moon, 
  Utensils, 
  Bus, 
  AlertTriangle, 
  CheckCircle, 
  Home, 
  Sparkles, 
  TrendingUp, 
  X, 
  ChevronRight, 
  Copy, 
  Printer, 
  Loader2, 
  Info, 
  DollarSign, 
  Luggage,
  ThumbsUp,
  Award,
  ChevronLeft
} from 'lucide-react';

// --- TS Interfaces ---
interface Overview {
  destination: string;
  duration: number;
  features: string[];
  bestSeason: string;
  budgetRange: string;
  packingList: string[];
  highlights: string[];
}

interface DailyPlan {
  day: number;
  theme: string;
  morning: {
    activities: string;
    duration: string;
    openTime: string;
  };
  afternoon: {
    activities: string;
    duration: string;
    openTime: string;
  };
  evening: {
    activities: string;
    duration: string;
    openTime: string;
  };
  food: {
    recommendations: string[];
    locations: string[];
  };
  transport: string;
}

interface Accommodation {
  tier: string;
  area: string;
  reason: string;
  targetGroup: string;
  priceRange: string;
  recommendations: string[];
}

interface FoodAndSouvenirs {
  mustEat: string[];
  dineIn: string[];
  souvenirs: string[];
  takeAway: string[];
  avoidList: string[];
}

interface TransportGuide {
  external: string[];
  internal: string[];
  connection: string[];
  parking: string;
}

interface TrapsAndTips {
  commonTraps: string[];
  avoidSpots: string[];
  clothingAndWeather: string;
  reservationNotice: string[];
  safetyTips: string[];
}

interface BudgetDetail {
  perPerson: {
    tickets: number;
    food: number;
    accommodation: number;
    transport: number;
    others: number;
  };
  totalRange: string;
  note: string;
}

interface Itinerary {
  overview: Overview;
  dailyPlans: DailyPlan[];
  accommodations: Accommodation[];
  foodAndSouvenirs: FoodAndSouvenirs;
  transportGuide: TransportGuide;
  trapsAndTips: TrapsAndTips;
  budgetDetail: BudgetDetail;
}

// Popular quick pick destinations
const QUICK_PICKS = [
  { name: '成都', days: 4, label: '美食人文·慢生活', style: '松弛沉浸' },
  { name: '大理', days: 5, label: '海风苍山·度假闲适', style: '海岛度假' },
  { name: '北京', days: 5, label: '历史古迹·经典红墙', style: '深度人文' },
  { name: '海南三亚', days: 4, label: '阳光沙滩·纯正海风', style: '海岛度假' },
  { name: '西双版纳', days: 3, label: '热带雨林·异国风情', style: '松弛沉浸' },
];

export default function App() {
  // Input states
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState('独自出行');
  const [style, setStyle] = useState('松弛沉浸');

  // Operational states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  // Active UI views
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'hotel' | 'food' | 'transport' | 'tips' | 'budget'>('overview');
  const [selectedDay, setSelectedDay] = useState(1);
  const [copied, setCopied] = useState(false);

  // Progressive loading texts to simulate travel planning stages
  const loadingSteps = [
    '正在分析目的地地理分布及就近路线串联...',
    '正在剔除高价网红鸡肋景点，筛选地道口碑好去处...',
    '正在匹配本地人推荐的高性价比特色美食...',
    '依据行程动线测算最优住宿选址与通勤性价比...',
    '正在整理最新的景区预约时效与当地避坑指南...',
    '10年经验旅行规划师正在为您细化时间分配，即将为您呈献...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleQuickPick = (pick: typeof QUICK_PICKS[0]) => {
    setDestination(pick.name);
    setDays(pick.days);
    setStyle(pick.style);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('请输入您想去的旅行目的地！');
      return;
    }

    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          days,
          travelers,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '服务器生成出错了，请稍后重试');
      }

      setItinerary(data);
      setActiveTab('overview');
      setSelectedDay(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '网络连接或API响应失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!itinerary) return;

    const mk = `
# 🌟 【10年规划师定制】${itinerary.overview.destination} ${itinerary.overview.duration}天 专属旅行攻略
> 出行人群：${travelers} | 游玩风格：${style}

## 🗺️ 一、旅行总览
- **最佳出行季节**: ${itinerary.overview.bestSeason}
- **整体消费预算**: ${itinerary.overview.budgetRange}
- **核心游玩特色**: ${itinerary.overview.features.join('、')}
- **行程核心亮点**:
${itinerary.overview.highlights.map(h => `  * ${h}`).join('\n')}

- **出行必备清单**:
${itinerary.overview.packingList.map(p => `  - [ ] ${p}`).join('\n')}

---

## 📅 二、每日详细行程安排
${itinerary.dailyPlans.map(plan => `
### Day ${plan.day} - ${plan.theme}
- **🌅 上午行程**: ${plan.morning.activities} (推荐时长: ${plan.morning.duration} | 开放时间: ${plan.morning.openTime})
- **🌇 下午行程**: ${plan.afternoon.activities} (推荐时长: ${plan.afternoon.duration} | 开放时间: ${plan.afternoon.openTime})
- **🌃 晚上行程**: ${plan.evening.activities} (推荐时长: ${plan.evening.duration} | 开放时间: ${plan.evening.openTime})
- **🍲 当日美食推荐**:
  * 美食: ${plan.food.recommendations.join('、')}
  * 地点: ${plan.food.locations.join('、')}
- **🚇 当日交通**: ${plan.transport}
`).join('\n')}

---

## 🏡 三、住宿区域及精选推荐
${itinerary.accommodations.map(acc => `
### 【${acc.tier}】${acc.area}
- **选址理由**: ${acc.reason}
- **适合人群**: ${acc.targetGroup}
- **参考价位**: ${acc.priceRange}
- **具体推荐**: ${acc.recommendations.join('、')}
`).join('\n')}

---

## 🍲 四、必吃美食&特产避坑清单
- **必吃地道小吃**: ${itinerary.foodAndSouvenirs.mustEat.join('、')}
- **推荐堂食正餐**: ${itinerary.foodAndSouvenirs.dineIn.join('、')}
- **必买特产伴手**: ${itinerary.foodAndSouvenirs.souvenirs.join('、')}
- **适合买来带走**: ${itinerary.foodAndSouvenirs.takeAway.join('、')}
- **⚠️ 避坑不推荐**: ${itinerary.foodAndSouvenirs.avoidList.join('、')}

---

## 🚇 五、大交通与市内交通全攻略
- **大交通大达建议**:
${itinerary.transportGuide.external.map(e => `  * ${e}`).join('\n')}
- **市内交通推荐**:
${itinerary.transportGuide.internal.map(i => `  * ${i}`).join('\n')}
- **景区衔接秘籍**:
${itinerary.transportGuide.connection.map(c => `  * ${c}`).join('\n')}
- **🚗 自驾与停车贴士**: ${itinerary.transportGuide.parking}

---

## 🛡️ 六、避坑指南与安全细节
- **避坑套路**:
${itinerary.trapsAndTips.commonTraps.map(t => `  * ${t}`).join('\n')}
- **避雷/平替景点**:
${itinerary.trapsAndTips.avoidSpots.map(s => `  * ${s}`).join('\n')}
- **穿衣天气指南**: ${itinerary.trapsAndTips.clothingAndWeather}
- **门票预约须知**:
${itinerary.trapsAndTips.reservationNotice.map(r => `  * ${r}`).join('\n')}
- **安全保障提醒**:
${itinerary.trapsAndTips.safetyTips.map(s => `  * ${s}`).join('\n')}

---

## 💰 七、精简预算明细 (单人核算)
- 🎫 景点门票: ¥${itinerary.budgetDetail.perPerson.tickets}
- 🍲 餐饮消费: ¥${itinerary.budgetDetail.perPerson.food}
- 🏨 住宿支出: ¥${itinerary.budgetDetail.perPerson.accommodation}
- 🚇 交通支出: ¥${itinerary.budgetDetail.perPerson.transport}
- 🛍️ 其他杂费: ¥${itinerary.budgetDetail.perPerson.others}
- **📊 预计人均消费总预算**: ${itinerary.budgetDetail.totalRange}
- **💡 预算说明**: ${itinerary.budgetDetail.note}
`;

    navigator.clipboard.writeText(mk.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#E9EDC9] selection:text-[#1C1917]" id="app-root">
      
      {/* HEADER BAR */}
      <header className="bg-[#FAF8F5] border-b-2 border-[#1C1917] sticky top-0 z-40" id="header-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#E9EDC9] text-[#1C1917] p-2.5 rounded-2xl border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-extrabold tracking-tight text-[#1C1917] flex items-center gap-2">
                AI 旅行规划师 <span className="bg-[#FAEDCD] text-[#8B5A2B] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#1C1917] shadow-[1px_1px_0px_0px_#1C1917]">10年经验匠心</span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">不赶路、不绕路，您的专属深度游玩定制顾问</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] bg-white px-3.5 py-2 rounded-full border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1C1917] animate-pulse"></span>
            DeepSeek 智能引擎已在线
          </div>
        </div>
      </header>

      {/* HERO HERO SECTION */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-[#1C1917] bg-[#FAF8F5]/50" id="hero-banner">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#FAEDCD] text-[#8B5A2B] text-xs font-bold px-3 py-1 rounded-full border border-[#1C1917] shadow-[1.5px_1.5px_0px_0px_#1C1917]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" /> 专属您的定制出游策略
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1C1917] tracking-tight leading-tight">
            告别流水线攻略，定制您的沉浸式完美旅程
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-medium leading-relaxed">
            只需输入【目的地】与【旅行天数】，10年专业规划师经验库将结合AI，自动匹配最适合的观光路线、极具口碑的本地老饕美食，以及贴心的防坑注意事项。
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        
        {/* INPUT PANEL + QUICK PICKS CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="main-grid">
          
          {/* LEFT COLUMN: CONSOLE (COL 5) */}
          <section className="lg:col-span-5 bg-[#FAF8F5] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_0px_#1C1917] p-6 sm:p-8" id="console-form">
            <h3 className="text-lg font-serif font-extrabold text-[#1C1917] mb-6 flex items-center gap-2">
              <span className="w-3 h-5 bg-[#CCD5AE] border border-[#1C1917] rounded-sm"></span>
              第一步：填写您的出游需求
            </h3>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Destination */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1C1917] mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D4A373]" />
                  旅行目的地
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="如: 成都、大理、西安、巴黎..."
                    className="w-full bg-white border-2 border-[#1C1917] rounded-2xl px-4 py-3.5 text-[#1C1917] placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-[#D4A373]/10 focus:border-[#D4A373] transition-all text-sm font-bold shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.05)]"
                    id="destination-input"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="absolute right-4.5 top-4.5 text-stone-400 hover:text-[#1C1917] transition-colors"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Picks */}
              <div>
                <span className="block text-xs font-bold text-stone-500 mb-2">热门目的地推荐快速点选：</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PICKS.map((pick) => {
                    const isSelected = destination === pick.name;
                    return (
                      <button
                        key={pick.name}
                        type="button"
                        onClick={() => handleQuickPick(pick)}
                        className={`text-xs px-3.5 py-2.5 rounded-xl border-2 transition-all text-left flex flex-col gap-0.5 ${
                          isSelected 
                            ? 'bg-[#FAEDCD] border-[#1C1917] text-[#1C1917] font-extrabold shadow-[3px_3px_0px_0px_#1C1917]' 
                            : 'bg-white border-[#1C1917]/10 text-stone-700 hover:border-[#1C1917] hover:shadow-[2px_2px_0px_0px_#1C1917]'
                        }`}
                        id={`quick-pick-${pick.name}`}
                      >
                        <span className="font-bold text-[#1C1917]">{pick.name} ({pick.days}天)</span>
                        <span className="text-[10px] text-stone-500 font-medium">{pick.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Days Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#D4A373]" />
                    旅行总天数
                  </label>
                  <span className="bg-[#E9EDC9] text-[#1C1917] text-xs font-extrabold px-3 py-1 rounded-lg border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]">
                    {days} 天行程
                  </span>
                </div>
                <div className="flex items-center py-2">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#D4A373] border border-stone-300"
                    id="days-slider"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 font-semibold px-0.5">
                  <span>1天 (短途必玩)</span>
                  <span>5天 (休闲均衡)</span>
                  <span>10天 (深度漫游)</span>
                  <span>15天 (长线探索)</span>
                </div>
              </div>

              {/* Travelers Selection Grid */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#D4A373]" />
                  出行人群
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['独自出行', '情侣/闺蜜', '亲子家庭', '父母长辈', '朋友结伴'].map((item) => {
                    const isSelected = travelers === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTravelers(item)}
                        className={`text-xs py-2.5 px-3 rounded-xl border-2 text-center transition-all font-bold ${
                          isSelected 
                            ? 'bg-[#CCD5AE] border-[#1C1917] text-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] font-extrabold' 
                            : 'bg-white border-[#1C1917]/15 text-stone-700 hover:border-[#1C1917] hover:bg-stone-50'
                        }`}
                        id={`traveler-${item}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  游玩风格
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '松弛沉浸', desc: '舒缓自在，深度漫游' },
                    { id: '经典打卡', desc: '地标必玩，全面覆盖' },
                    { id: '特种兵游', desc: '高效率打卡，充实紧凑' },
                    { id: '深度人文', desc: '历史底蕴，避开拥挤' },
                  ].map((styleObj) => {
                    const isSelected = style === styleObj.id;
                    return (
                      <button
                        key={styleObj.id}
                        type="button"
                        onClick={() => setStyle(styleObj.id)}
                        className={`text-xs p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-0.5 ${
                          isSelected 
                            ? 'bg-[#FAEDCD] border-[#1C1917] text-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] font-extrabold' 
                            : 'bg-white border-[#1C1917]/15 text-stone-700 hover:border-[#1C1917] hover:bg-stone-50'
                        }`}
                        id={`style-${styleObj.id}`}
                      >
                        <span className="font-extrabold text-[#1C1917]">{styleObj.id}</span>
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-stone-900/80' : 'text-stone-400'}`}>
                          {styleObj.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 transition-all border-2 ${
                  loading 
                    ? 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none' 
                    : 'bg-[#D4A373] text-[#1C1917] hover:bg-[#c69463] border-[#1C1917] shadow-[4px_4px_0px_0px_#1C1917] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#1C1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1C1917]'
                }`}
                id="generate-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在为您智能规划中...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    开始生成深度专属攻略
                  </>
                )}
              </button>
            </form>

            {/* Trapper Banner */}
            <div className="mt-6 bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4.5 flex gap-3.5 text-xs text-stone-600">
              <Award className="w-5 h-5 text-[#D4A373] shrink-0" />
              <div>
                <span className="font-extrabold text-[#1C1917] block mb-0.5">规划师承诺：</span>
                行程全部采用就近连接，100%避开黑心景区购物点与虚高标价网红餐厅，确保大众实用。
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: LOADING OR ITINERARY DISPLAY (COL 7) */}
          <section className="lg:col-span-7 flex flex-col" id="output-pane">
            
            {/* 1. INITIAL EMPTY STATE */}
            {!loading && !itinerary && !error && (
              <div className="bg-white rounded-3xl border-2 border-dashed border-[#1C1917]/30 py-16 px-6 text-center shadow-none flex flex-col items-center justify-center h-full min-h-[500px]" id="empty-state">
                <div className="w-16 h-16 bg-[#FAEDCD] border-2 border-[#1C1917] rounded-2xl flex items-center justify-center text-[#1C1917] mb-4 shadow-[2px_2px_0px_0px_#1C1917]">
                  <Compass className="w-8 h-8 text-[#1C1917] animate-pulse" />
                </div>
                <h4 className="text-lg font-serif font-extrabold text-[#1C1917] mb-2">等候您的探索灵感</h4>
                <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 font-medium leading-relaxed">
                  在左侧输入您期盼的目的地城市与游玩天数，10年规划师将根据您选择的人群与游玩习惯，为您定制松弛舒缓的专属路线。
                </p>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-600 bg-[#E9EDC9]/30 border-2 border-[#1C1917]/20 px-4 py-2 rounded-full">
                  <Info className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  支持全球城市游、自然景区、古镇海岛等各类风格
                </div>
              </div>
            )}

            {/* 2. LOADING STATE */}
            {loading && (
              <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#1C1917] p-8 sm:p-12 text-center shadow-[6px_6px_0px_0px_#1C1917] flex flex-col items-center justify-center h-full min-h-[500px]" id="loading-state">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-stone-200 border-t-[#D4A373] rounded-full animate-spin"></div>
                  <Compass className="w-8 h-8 text-[#1C1917] absolute inset-0 m-auto animate-pulse" />
                </div>
                
                <h4 className="text-xl font-serif font-extrabold text-[#1C1917] mb-4 animate-pulse">
                  专属旅行规划师正在排盘中...
                </h4>
                
                {/* Step Indicators */}
                <div className="w-full max-w-md bg-stone-200 h-2.5 rounded-full overflow-hidden border-2 border-[#1C1917] mb-6">
                  <div 
                    className="bg-[#D4A373] h-full transition-all duration-500" 
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Subtext stage changing */}
                <div className="min-h-[48px] px-4">
                  <p className="text-sm text-stone-700 font-extrabold transition-opacity duration-300">
                    {loadingSteps[loadingStep]}
                  </p>
                  <span className="text-xs text-stone-500 block mt-1">大约需要 10-25 秒，精彩值得期待</span>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-3.5 w-full max-w-sm">
                  <div className="bg-white border-2 border-[#1C1917] p-2.5 rounded-xl text-center shadow-[2px_2px_0px_0px_#1C1917]">
                    <span className="block text-[10px] text-stone-500 font-bold">地理动线</span>
                    <span className="text-xs font-extrabold text-emerald-700">合理顺路</span>
                  </div>
                  <div className="bg-white border-2 border-[#1C1917] p-2.5 rounded-xl text-center shadow-[2px_2px_0px_0px_#1C1917]">
                    <span className="block text-[10px] text-stone-500 font-bold">餐食标准</span>
                    <span className="text-xs font-extrabold text-[#8B5A2B]">杜绝刺客</span>
                  </div>
                  <div className="bg-white border-2 border-[#1C1917] p-2.5 rounded-xl text-center shadow-[2px_2px_0px_0px_#1C1917]">
                    <span className="block text-[10px] text-stone-500 font-bold">避坑提醒</span>
                    <span className="text-xs font-extrabold text-emerald-700">全线覆盖</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ERROR STATE */}
            {error && (
              <div className="bg-[#FAF8F5] border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px] shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)]" id="error-state">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl border-2 border-red-500 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-serif font-extrabold text-red-900 mb-2">生成攻略遇到了阻碍</h4>
                <p className="text-sm text-red-700 max-w-md mx-auto mb-6 font-bold">
                  {error}
                </p>
                <div className="bg-white border-2 border-[#1C1917] rounded-2xl p-4 text-xs text-stone-600 text-left max-w-md shadow-[3px_3px_0px_0px_#1C1917]">
                  <p className="font-extrabold text-[#1C1917] mb-1">💡 解决方案建议：</p>
                  <ol className="list-decimal pl-4 space-y-1 font-medium">
                    <li>确保已在 AI Studio 侧边栏的 <b>Secrets</b> 面板添加并启用了名为 <code className="bg-stone-100 px-1.5 py-0.5 rounded text-amber-900 font-bold">DEEPSEEK_API_KEY</code> 的密钥。</li>
                    <li>如果是网络波动，可以尝试点击左侧按钮重新生成。</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 4. SUCCESS ITINERARY DISPLAY */}
            {itinerary && !loading && (
              <div className="flex flex-col h-full bg-[#FAF8F5] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_0px_#1C1917] overflow-hidden print:border-none print:shadow-none" id="itinerary-display">
                
                {/* Result Top Cover Banner */}
                <div className="bg-[#FAEDCD] text-[#1C1917] p-6 sm:p-8 relative overflow-hidden border-b-2 border-[#1C1917] print:text-black print:bg-white print:border-b-2">
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 pointer-events-none">
                    <Compass className="w-48 h-48 text-[#8B5A2B]" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-[#CCD5AE] text-[#1C1917] text-xs font-bold px-2.5 py-1 rounded-full border border-[#1C1917] shadow-[1px_1px_0px_0px_#1C1917]">
                          10年规划师匠心专属定制
                        </span>
                        <span className="bg-[#E9EDC9] text-[#1C1917] text-xs font-bold px-2.5 py-1 rounded-full border border-[#1C1917] shadow-[1px_1px_0px_0px_#1C1917]">
                          精选避坑
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-[#1C1917]">
                        {itinerary.overview.destination} · {itinerary.overview.duration}天沉浸之旅
                      </h3>
                      <p className="text-stone-600 text-xs mt-1 font-bold">
                        人群: <span className="text-[#1C1917]">{travelers}</span> | 风格: <span className="text-[#1C1917]">{style}</span> | 预算: <span className="text-amber-900">{itinerary.overview.budgetRange}</span>
                      </p>
                    </div>

                    {/* Quick utilities */}
                    <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 print:hidden">
                      <button
                        onClick={copyMarkdown}
                        className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          copied 
                            ? 'bg-[#CCD5AE] border-[#1C1917] text-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]' 
                            : 'bg-white border-[#1C1917] text-[#1C1917] hover:bg-stone-50 shadow-[2px_2px_0px_0px_#1C1917] hover:shadow-[3px_3px_0px_0px_#1C1917]'
                        }`}
                        title="复制整篇Markdown到剪贴板，方便在手机微信或便签查看"
                        id="copy-markdown-btn"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            已复制马克
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            复制Markdown
                          </>
                        )}
                      </button>

                      <button
                        onClick={triggerPrint}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border-2 border-[#1C1917] text-[#1C1917] hover:bg-stone-50 shadow-[2px_2px_0px_0px_#1C1917] hover:shadow-[3px_3px_0px_0px_#1C1917] transition-all"
                        id="print-itinerary-btn"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        打印
                      </button>
                    </div>
                  </div>
                </div>

                {/* HORIZONTAL TAB BAR (7 Plates Selector) */}
                <div className="bg-[#FAF8F5] border-b-2 border-[#1C1917] overflow-x-auto scrollbar-none flex sticky top-[72px] sm:top-[73px] z-30 print:hidden" id="tab-navigation">
                  {[
                    { id: 'overview', label: '🗺️ 游玩总览' },
                    { id: 'daily', label: '📅 每日行程' },
                    { id: 'hotel', label: '🏡 推荐住宿' },
                    { id: 'food', label: '🍲 美食特产' },
                    { id: 'transport', label: '🚇 交通攻略' },
                    { id: 'tips', label: '🛡️ 避坑细节' },
                    { id: 'budget', label: '💰 预算明细' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`text-xs px-4 py-4 font-extrabold transition-all whitespace-nowrap shrink-0 border-r-2 border-[#1C1917] ${
                        activeTab === tab.id 
                          ? 'bg-[#E9EDC9] text-[#1C1917]' 
                          : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/50'
                      }`}
                      id={`tab-btn-${tab.id}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT AREA */}
                <div className="p-6 sm:p-8 flex-grow overflow-y-auto max-h-[600px] print:max-h-none print:overflow-visible" id="tab-content">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in" id="content-overview">
                      {/* Features Badges */}
                      <div>
                        <span className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-2">核心特色标签</span>
                        <div className="flex flex-wrap gap-2">
                          {itinerary.overview.features.map((feat, idx) => (
                            <span key={idx} className="bg-[#E9EDC9] text-[#1C1917] text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#D4A373]" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Best Season & Budget Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4">
                          <span className="text-xs text-[#D4A373] font-extrabold block mb-1">🌸 最佳出行季节</span>
                          <p className="text-sm text-[#1C1917] font-extrabold leading-relaxed">
                            {itinerary.overview.bestSeason}
                          </p>
                        </div>
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4">
                          <span className="text-xs text-[#D4A373] font-extrabold block mb-1">💰 估算人均预算</span>
                          <p className="text-sm text-stone-800 font-extrabold">
                            {itinerary.overview.budgetRange}
                          </p>
                          <span className="text-[10px] text-stone-400 font-bold block mt-0.5">（含基础吃住行和门票，不含奢华消费）</span>
                        </div>
                      </div>

                      {/* Itinerary Highlights */}
                      <div className="bg-[#FAEDCD]/40 border-2 border-[#1C1917] shadow-[4px_4px_0px_0px_#1C1917] rounded-2xl p-5">
                        <h4 className="text-sm font-extrabold text-[#1C1917] mb-3 flex items-center gap-1.5">
                          <Award className="w-4.5 h-4.5 text-[#D4A373]" />
                          行程核心亮点设计
                        </h4>
                        <ul className="space-y-2.5">
                          {itinerary.overview.highlights.map((hl, idx) => (
                            <li key={idx} className="flex gap-2.5 text-sm text-[#1C1917]">
                              <span className="w-5 h-5 rounded-lg bg-[#E9EDC9] border border-[#1C1917] text-[#1C1917] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_#1C1917]">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed font-bold">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Travel Packing List */}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1C1917] mb-3 flex items-center gap-1.5">
                          <Luggage className="w-4.5 h-4.5 text-[#D4A373]" />
                          出行必备行李清单
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {itinerary.overview.packingList.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] px-3.5 py-3 rounded-xl text-xs text-stone-800 font-extrabold hover:translate-y-[-1px] transition-all">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DAILY ITINERARY */}
                  {activeTab === 'daily' && (
                    <div className="space-y-6 animate-fade-in" id="content-daily">
                      
                      {/* Day Select Rail */}
                      <div className="flex gap-2 overflow-x-auto pb-2 border-b-2 border-[#1C1917]/10 scrollbar-none">
                        {itinerary.dailyPlans.map((plan) => {
                          const isSelected = selectedDay === plan.day;
                          return (
                            <button
                              key={plan.day}
                              onClick={() => setSelectedDay(plan.day)}
                              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 border-2 ${
                                isSelected 
                                  ? 'bg-[#E9EDC9] border-[#1C1917] text-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]' 
                                  : 'bg-white border-[#1C1917]/15 text-stone-600 hover:border-[#1C1917] hover:bg-stone-50'
                              }`}
                              id={`day-select-${plan.day}`}
                            >
                              第 {plan.day} 天
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Day Content */}
                      {itinerary.dailyPlans.filter(p => p.day === selectedDay).map((plan) => (
                        <div key={plan.day} className="space-y-6">
                          
                          {/* Day Theme */}
                          <div className="bg-[#FAEDCD]/50 border-2 border-[#1C1917] p-4.5 rounded-2xl shadow-[3px_3px_0px_0px_#1C1917]">
                            <span className="text-xs text-stone-500 font-extrabold block uppercase tracking-wider">Day {plan.day} 主题节奏</span>
                            <h4 className="text-base font-serif font-extrabold text-[#1C1917] mt-0.5">
                              {plan.theme}
                            </h4>
                          </div>

                          {/* Chronological Blocks */}
                          <div className="relative border-l-2 border-[#1C1917]/20 pl-6 ml-3 space-y-6">
                            
                            {/* Morning */}
                            <div className="relative">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[32px] top-1.5 w-4.5 h-4.5 rounded-md bg-[#FAEDCD] border-2 border-[#1C1917] flex items-center justify-center shadow-none z-10">
                                <Sun className="w-2.5 h-2.5 text-[#1C1917]" />
                              </span>
                              <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4.5 hover:translate-y-[-1px] transition-all">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="text-xs font-extrabold text-[#8B5A2B] tracking-wide flex items-center gap-1">
                                    🌅 上午行程 (Morning)
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold">
                                    <span>⏱️ {plan.morning.duration}</span>
                                    <span>🕒 {plan.morning.openTime}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-stone-800 leading-relaxed font-bold">
                                  {plan.morning.activities}
                                </p>
                              </div>
                            </div>

                            {/* Afternoon */}
                            <div className="relative">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[32px] top-1.5 w-4.5 h-4.5 rounded-md bg-[#FAEDCD] border-2 border-[#1C1917] flex items-center justify-center shadow-none z-10">
                                <CloudSun className="w-2.5 h-2.5 text-[#1C1917]" />
                              </span>
                              <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4.5 hover:translate-y-[-1px] transition-all">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="text-xs font-extrabold text-orange-700 tracking-wide flex items-center gap-1">
                                    🌇 下午行程 (Afternoon)
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold">
                                    <span>⏱️ {plan.afternoon.duration}</span>
                                    <span>🕒 {plan.afternoon.openTime}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-stone-800 leading-relaxed font-bold">
                                  {plan.afternoon.activities}
                                </p>
                              </div>
                            </div>

                            {/* Evening */}
                            <div className="relative">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[32px] top-1.5 w-4.5 h-4.5 rounded-md bg-[#FAEDCD] border-2 border-[#1C1917] flex items-center justify-center shadow-none z-10">
                                <Moon className="w-2.5 h-2.5 text-[#1C1917]" />
                              </span>
                              <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-4.5 hover:translate-y-[-1px] transition-all">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="text-xs font-extrabold text-stone-800 tracking-wide flex items-center gap-1">
                                    🌃 晚上行程 (Evening)
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold">
                                    <span>⏱️ {plan.evening.duration}</span>
                                    <span>🕒 {plan.evening.openTime}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-stone-800 leading-relaxed font-bold">
                                  {plan.evening.activities}
                                </p>
                              </div>
                            </div>

                          </div>

                          {/* Food Suggestions for the day */}
                          <div className="bg-[#FAEDCD]/30 border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5">
                            <h5 className="text-sm font-extrabold text-[#1C1917] mb-2.5 flex items-center gap-1.5">
                              <Utensils className="w-4.5 h-4.5 text-[#D4A373]" />
                              当日吃什么 (Daily Food Vetted)
                            </h5>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-[#8B5A2B] font-extrabold">老饕推荐：</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {plan.food.recommendations.map((food, idx) => (
                                    <span key={idx} className="bg-white text-stone-800 text-xs px-2.5 py-1 rounded-lg border-2 border-[#1C1917] font-bold shadow-[1px_1px_0px_0px_#1C1917]">
                                      {food}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-stone-600 mt-1 font-bold">
                                <span className="font-extrabold text-stone-800">推荐聚集区:</span> {plan.food.locations.join('、')}
                              </div>
                            </div>
                          </div>

                          {/* Transport for the day */}
                          <div className="bg-white border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] rounded-2xl p-4 text-xs text-stone-600 flex gap-2.5 items-center">
                            <Bus className="w-4.5 h-4.5 text-[#D4A373] shrink-0" />
                            <div className="font-bold">
                              <span className="font-extrabold text-stone-800">当日出行贴士: </span>
                              {plan.transport}
                            </div>
                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                  {/* TAB 3: ACCOMMODATION */}
                  {activeTab === 'hotel' && (
                    <div className="space-y-6 animate-fade-in" id="content-hotel">
                      <div className="bg-[#E9EDC9]/40 border-2 border-[#1C1917] text-[#1C1917] text-xs p-4 rounded-2xl flex gap-2.5 shadow-[2px_2px_0px_0px_#1C1917]">
                        <Info className="w-4.5 h-4.5 text-[#8B5A2B] shrink-0" />
                        <div>
                          <span className="font-extrabold">选址基本法: </span>
                          我们根据您的每日行程走向动态匹配最方便的住址。已为您规划以下三个梯度的口碑推荐：
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {itinerary.accommodations.map((acc, idx) => (
                          <div key={idx} className="bg-white border-2 border-[#1C1917] rounded-2xl shadow-[3px_3px_0px_0px_#1C1917] hover:translate-y-[-1px] transition-all overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="bg-[#FAF8F5] p-4 border-b-2 border-[#1C1917]">
                              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg mb-1 border-2 border-[#1C1917] shadow-[1px_1px_0px_0px_#1C1917] ${
                                acc.tier === '性价比平价' ? 'bg-[#E9EDC9] text-[#1C1917]' :
                                acc.tier === '中端舒适' ? 'bg-[#FAEDCD] text-[#1C1917]' :
                                'bg-[#CCD5AE] text-[#1C1917]'
                              }`}>
                                {acc.tier}
                              </span>
                              <h4 className="text-sm font-extrabold text-[#1C1917] mt-1 flex items-center gap-1.5">
                                <Home className="w-4 h-4 text-[#D4A373]" />
                                {acc.area}
                              </h4>
                            </div>

                            {/* Card Body */}
                            <div className="p-4.5 flex-grow space-y-3.5 text-xs text-stone-700">
                              <div>
                                <span className="font-extrabold text-stone-900 block mb-0.5">选址依据</span>
                                <p className="leading-relaxed font-bold">{acc.reason}</p>
                              </div>
                              
                              <div>
                                <span className="font-extrabold text-stone-900 block mb-0.5">人群定位</span>
                                <p className="font-extrabold text-[#1C1917]">{acc.targetGroup}</p>
                              </div>

                              <div>
                                <span className="font-extrabold text-stone-900 block mb-0.5">参考均价</span>
                                <p className="text-amber-900 font-extrabold">{acc.priceRange}</p>
                              </div>

                              <div className="border-t-2 border-[#1C1917]/10 pt-3.5">
                                <span className="font-extrabold text-[#1C1917] block mb-2">规划师推荐酒店/客栈</span>
                                <div className="space-y-1.5">
                                  {acc.recommendations.map((rec, rIdx) => (
                                    <div key={rIdx} className="flex items-center gap-1.5 text-stone-800 font-extrabold">
                                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: FOOD & SOUVENIRS */}
                  {activeTab === 'food' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="content-food">
                      
                      {/* Left: Food Section */}
                      <div className="space-y-6">
                        
                        {/* Must Eat */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2.5 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#D4A373] rounded-full"></span>
                            必吃地道特色美味
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {itinerary.foodAndSouvenirs.mustEat.map((food, idx) => (
                              <span key={idx} className="bg-[#FAEDCD] text-[#1C1917] text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-[#1C1917] shadow-[1.5px_1.5px_0px_0px_#1C1917]">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Dine In Recommendations */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2.5 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#CCD5AE] rounded-full"></span>
                            堂食正餐/特色小馆推荐
                          </h4>
                          <ul className="space-y-2 text-xs text-stone-800">
                            {itinerary.foodAndSouvenirs.dineIn.map((shop, idx) => (
                              <li key={idx} className="flex gap-2 font-bold leading-relaxed">
                                <span className="text-[#D4A373] shrink-0 font-extrabold">•</span>
                                <span>{shop}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Souvenirs & Warnings */}
                      <div className="space-y-6">
                        
                        {/* Souvenirs */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2.5 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#E9EDC9] rounded-full"></span>
                            当地特色特产&手信
                          </h4>
                          <div className="space-y-3.5 text-xs">
                            <div>
                              <span className="font-extrabold text-stone-500 block">核心特产:</span>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {itinerary.foodAndSouvenirs.souvenirs.map((sou, idx) => (
                                  <span key={idx} className="bg-[#E9EDC9] text-[#1C1917] px-2.5 py-1 rounded-lg border-2 border-[#1C1917] font-bold shadow-[1px_1px_0px_0px_#1C1917]">
                                    {sou}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="pt-2">
                              <span className="font-extrabold text-stone-500 block mb-1">适合买来带走：</span>
                              <p className="text-stone-700 font-bold leading-relaxed">{itinerary.foodAndSouvenirs.takeAway.join('、')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Food Trap Alert */}
                        <div className="bg-[#FAEDCD]/40 border-2 border-red-500 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.15)] space-y-2.5">
                          <h4 className="text-sm font-extrabold text-red-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
                            ⚠️ 美食老饕避雷防坑项
                          </h4>
                          <ul className="space-y-1.5 text-xs text-red-800">
                            {itinerary.foodAndSouvenirs.avoidList.map((warn, idx) => (
                              <li key={idx} className="flex gap-2 leading-relaxed font-bold">
                                <span className="font-bold shrink-0">❌</span>
                                <span>{warn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 5: TRANSPORT */}
                  {activeTab === 'transport' && (
                    <div className="space-y-6 animate-fade-in" id="content-transport">
                      
                      {/* Big Transport Header */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* External */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2 flex items-center gap-2">
                            🛫 大交通抵达与枢纽衔接
                          </h4>
                          <ul className="space-y-2 text-xs text-stone-700 font-bold leading-relaxed">
                            {itinerary.transportGuide.external.map((ext, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span className="text-[#D4A373] font-extrabold">•</span>
                                <span>{ext}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Internal */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2 flex items-center gap-2">
                            🚌 市内日常通勤出行
                          </h4>
                          <ul className="space-y-2 text-xs text-stone-700 font-bold leading-relaxed">
                            {itinerary.transportGuide.internal.map((int, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span className="text-[#D4A373] font-extrabold">•</span>
                                <span>{int}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Connections */}
                        <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-[#1C1917] border-b-2 border-[#1C1917]/10 pb-2 flex items-center gap-2">
                            🚇 景区之间中转衔接
                          </h4>
                          <ul className="space-y-2 text-xs text-stone-700 font-bold leading-relaxed">
                            {itinerary.transportGuide.connection.map((conn, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span className="text-[#D4A373] font-extrabold">•</span>
                                <span>{conn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Parking Self-Drive tips */}
                      <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5">
                        <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-2">🚗 自驾及停车状况评估</h4>
                        <p className="text-sm text-stone-800 leading-relaxed font-bold">
                          {itinerary.transportGuide.parking}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* TAB 6: TRAPS & TIPS */}
                  {activeTab === 'tips' && (
                    <div className="space-y-6 animate-fade-in" id="content-tips">
                      
                      {/* Grid cards of warnings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Common scams */}
                        <div className="bg-[#FAEDCD]/40 border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                            <AlertTriangle className="w-4.5 h-4.5 text-[#D4A373]" />
                            警惕隐形套路与消费骗局
                          </h4>
                          <ul className="space-y-2.5 text-xs text-stone-800 font-bold">
                            {itinerary.trapsAndTips.commonTraps.map((scam, idx) => (
                              <li key={idx} className="flex gap-2 leading-relaxed">
                                <span className="text-amber-700 font-bold shrink-0">⚠️</span>
                                <span>{scam}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Avoid spots /平替 */}
                        <div className="bg-white border-2 border-red-500 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.15)] rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-extrabold text-red-950 flex items-center gap-2">
                            🚫 避雷不踩坑景点与平替选择
                          </h4>
                          <ul className="space-y-2.5 text-xs text-stone-800 font-bold">
                            {itinerary.trapsAndTips.avoidSpots.map((spot, idx) => (
                              <li key={idx} className="flex gap-2 leading-relaxed">
                                <span className="text-red-500 font-bold shrink-0">❌</span>
                                <span>{spot}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Ticket Reservations */}
                      <div className="bg-white border-2 border-[#1C1917] shadow-[3px_3px_0px_0px_#1C1917] rounded-2xl p-5 space-y-3">
                        <h4 className="text-sm font-extrabold text-[#1C1917] flex items-center gap-1.5">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                          提前预约重点说明 (必看！)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {itinerary.trapsAndTips.reservationNotice.map((note, idx) => (
                            <div key={idx} className="bg-[#FAF8F5] border-2 border-[#1C1917] p-3.5 rounded-xl text-xs text-stone-800 font-extrabold leading-relaxed flex gap-2">
                              <span className="w-5 h-5 rounded bg-[#E9EDC9] border border-[#1C1917] text-[#1C1917] flex items-center justify-center shrink-0 font-extrabold shadow-[1px_1px_0px_0px_#1C1917]">
                                {idx + 1}
                              </span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clothing weather & Safety */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] rounded-xl p-4 text-xs">
                          <span className="font-extrabold text-stone-400 block mb-1">🧥 穿衣天气穿搭说明</span>
                          <p className="text-stone-700 leading-relaxed font-bold">{itinerary.trapsAndTips.clothingAndWeather}</p>
                        </div>
                        <div className="bg-white border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917] rounded-xl p-4 text-xs">
                          <span className="font-extrabold text-stone-400 block mb-1">🛡️ 出游安全及习惯建议</span>
                          <p className="text-stone-700 leading-relaxed font-bold">{itinerary.trapsAndTips.safetyTips.join('；')}</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 7: BUDGET DETAILS */}
                  {activeTab === 'budget' && (
                    <div className="space-y-6 animate-fade-in" id="content-budget">
                      
                      {/* Budget Header Card */}
                      <div className="bg-[#CCD5AE] text-[#1C1917] border-2 border-[#1C1917] rounded-2xl p-6 text-center space-y-2 relative overflow-hidden shadow-[4px_4px_0px_0px_#1C1917]">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                          <DollarSign className="w-32 h-32 text-[#8B5A2B]" />
                        </div>
                        <span className="text-xs text-stone-700 font-extrabold uppercase tracking-wider block">预计人均整体总预算</span>
                        <h4 className="text-3xl font-serif font-extrabold text-[#1C1917]">
                          {itinerary.budgetDetail.totalRange}
                        </h4>
                        <p className="text-stone-800 text-xs font-bold max-w-md mx-auto leading-relaxed">
                          {itinerary.budgetDetail.note}
                        </p>
                      </div>

                      {/* Cost Breakdown Visual */}
                      <div className="bg-white border-2 border-[#1C1917] rounded-2xl p-5 shadow-[3px_3px_0px_0px_#1C1917] space-y-5">
                        <h4 className="text-sm font-extrabold text-[#1C1917]">
                          人均费用项目细化明细 (基础模型参考)
                        </h4>

                        <div className="space-y-4">
                          {[
                            { name: '🎫 景点门票', value: itinerary.budgetDetail.perPerson.tickets, color: 'bg-[#D4A373]' },
                            { name: '🍲 餐饮费用', value: itinerary.budgetDetail.perPerson.food, color: 'bg-[#FAEDCD]' },
                            { name: '🏨 酒店住宿分摊', value: itinerary.budgetDetail.perPerson.accommodation, color: 'bg-[#CCD5AE]' },
                            { name: '🚇 市内/大交通', value: itinerary.budgetDetail.perPerson.transport, color: 'bg-[#E9EDC9]' },
                            { name: '🛍️ 其他不可预见杂费', value: itinerary.budgetDetail.perPerson.others, color: 'bg-stone-300' },
                          ].map((item, idx) => {
                            const total = itinerary.budgetDetail.perPerson.tickets + 
                                          itinerary.budgetDetail.perPerson.food + 
                                          itinerary.budgetDetail.perPerson.accommodation + 
                                          itinerary.budgetDetail.perPerson.transport + 
                                          itinerary.budgetDetail.perPerson.others;
                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                            
                            return (
                              <div key={idx} className="space-y-1 text-xs">
                                <div className="flex justify-between font-bold">
                                  <span className="text-stone-600">{item.name}</span>
                                  <span className="text-[#1C1917] font-extrabold">¥{item.value} <span className="text-stone-400 font-normal">({pct.toFixed(1)}%)</span></span>
                                </div>
                                <div className="w-full bg-stone-100 h-3 rounded-md overflow-hidden border border-[#1C1917]/20">
                                  <div className={`${item.color} border-r border-[#1C1917] h-full rounded-l-md`} style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Print Footer block only shown in print */}
                <div className="hidden print:block text-center border-t-2 pt-8 mt-8 text-xs text-stone-500 font-bold">
                  此攻略由 [AI 旅行规划师] 专程生成，版权归出行人所有。请在旅行时随时参照。
                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white text-stone-500 py-10 border-t-2 border-[#1C1917] mt-auto text-xs text-center" id="footer-section">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-extrabold text-[#1C1917]">AI 10年匠心旅行规划师精选 © 2026</p>
          <p className="max-w-2xl mx-auto leading-relaxed font-semibold text-stone-600">
            我们的规划师数据来自全球数百座核心旅游城市的最新实地考察与本地消费者评价。
            我们承诺不向用户推荐任何带佣、返点、购物团和欺客景点，主打高性价比、不累人、不套路的极致深度体验。
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 font-extrabold">
            <span>支持多天数定制</span>
            <span>•</span>
            <span>适配各类同行人群</span>
            <span>•</span>
            <span>100%老饕认证美食</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
