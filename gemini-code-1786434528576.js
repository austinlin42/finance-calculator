import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

// 多國語系字典
const messages = {
  zh: {
    tabs: { budget: '1. 預算規劃工具', fire: '2. 財富自由計算機', regular: '3. 定期定額計算機' },
    budget: {
      refTitle: '填寫參考指南', summaryTitle: '年度預算總結', needs: '生存 / 需要 (Needs)', wants: '生活 / 想要 (Wants)',
      totalBudget: '總年度預算 (Avg/月)', monthlyAvg: '每月約', category: '類別', item: '項目', freq: '頻率', amount: '金額', annual: '年花費',
      addNeed: '新增需要項目', addWant: '新增想要項目'
    },
    refDesc: { food: '三餐/聚餐', clothing: '衣物/保養', housing: '水電/房租', transport: '通勤/油資', education: '學費/書籍', fun: '影音/旅遊', medical: '就醫/保健', misc: '禮物/雜項', tax: '所得/保險' },
    categories: { food: '🍔 食', clothing: '👕 衣', housing: '🏠 住', transport: '🚗 行', education: '📚 育', fun: '🎮 樂', medical: '💊 醫', misc: '🎁 雜', tax: '📄 稅' },
    freqs: { day: '日', week: '週', month: '月', bimonth: '雙月', quarter: '季', year: '年' },
    units: { age: '歲', currency: '$', year: '年' },
    fireGuide: {
      title: '使用說明與情境範例 Guide & Examples', expand: '展開指南', collapse: '收起指南',
      step1Title: '設定年齡與年花費', step1Desc: '填入目前與預計退休年齡，估算退休後每年生活費（可參考工具一）。',
      step2Title: '預期殖利率 (R)', step2Desc: '退休後資產提領率，歷史經驗約填 4% ~ 5%。',
      step3Title: '大盤年化報酬 (r)', step3Desc: '累積期投資大盤ETF（如 VOO/VT）的年化報酬率，約填 7% ~ 8%。',
      exampleTitle: '實例：28 歲小明目標 55 歲退休',
      exampleDesc: '目前資產 60 萬元，預計活到 80 歲，退休後每月花費 7 萬元（每年 84 萬）。大盤報酬 7%、退休殖利率 5%。試算每月需定期定額投入 $9,093 元達標！',
      loadExampleBtn: '帶入此範例數據'
    },
    fire: {
      goalTitle: '目標設定', planTitle: 'Plan (達成計畫)', currentAge: '我今年幾歲', fireAge: '預計FIRE退休年齡', deathAge: '預計活到幾歲', annualWithdraw: '退休後每年提領',
      currentSavings: '目前已備資產', yieldRate: '預期殖利率 (R)', investReturn: '大盤年化報酬 (r)', targetHeader: '財富自由需要累積', planHeader: '計畫（每月需定期定額）',
      formulaPV: '公式推導 (期初現值):', targetDesc: '目標 = 每年提領 × (1+R) × PV', formulaFV: '公式推導 (年金終值):', planDesc: '每月需存 = 資金缺口 / FV'
    },
    regular: {
      paramsTitle: '參數設定', monthlyInvest: '每月定期定額投入', annualRate: '預期年化報酬率 (r%)', years: '預計持續年數 (n)', resultTitle: '預期累積金額',
      formulaTitle: '公式推導 (年金終值 FV)：', moRateText: '月利率', totalPeriods: '總期數', monthsText: '個月', formulaDesc: '累積金額 = 每月投入 × 終值係數'
    }
  },
  en: {
    tabs: { budget: '1. Budget Planner', fire: '2. FIRE Calculator', regular: '3. Regular Investment' },
    budget: {
      refTitle: 'Filling Reference Guide', summaryTitle: 'Annual Budget Summary', needs: 'Needs', wants: 'Wants',
      totalBudget: 'Total Annual Budget (Avg/Mo)', monthlyAvg: 'Monthly ~', category: 'Category', item: 'Item', freq: 'Freq.', amount: 'Amount', annual: 'Annual',
      addNeed: 'Add Need', addWant: 'Add Want'
    },
    refDesc: { food: 'Meals', clothing: 'Apparel', housing: 'Rent/Utilities', transport: 'Commute', education: 'Tuition/Books', fun: 'Travel/Media', medical: 'Healthcare', misc: 'Gifts/Misc', tax: 'Tax/Insurance' },
    categories: { food: '🍔 Food', clothing: '👕 Cloth', housing: '🏠 House', transport: '🚗 Trans', education: '📚 Edu', fun: '🎮 Fun', medical: '💊 Med', misc: '🎁 Misc', tax: '📄 Tax' },
    freqs: { day: 'Day', week: 'Week', month: 'Month', bimonth: 'Bi-Mo', quarter: 'Qtr', year: 'Year' },
    units: { age: 'yo', currency: '$', year: 'Yrs' },
    fireGuide: {
      title: 'Guide & Scenario Examples', expand: 'Show Guide', collapse: 'Hide Guide',
      step1Title: 'Set Age & Withdrawal', step1Desc: 'Enter current & retirement age. Estimate annual retirement expenses.',
      step2Title: 'Yield Rate (R)', step2Desc: 'Expected return rate during retirement. Historically 4% ~ 5% is safe.',
      step3Title: 'Market Return (r)', step3Desc: 'Expected return on index ETFs during accumulation, typically ~7% - 8%.',
      exampleTitle: 'Example: 28yo Alex targets FIRE at 55',
      exampleDesc: 'Current savings $600k, life expectancy 80yo. Desired retirement spending $70k/mo ($840k/yr). Market return 7%, yield 5%. Required monthly saving is only $9,093!',
      loadExampleBtn: 'Load Example Scenario'
    },
    fire: {
      goalTitle: 'Goal Settings', planTitle: 'Plan', currentAge: 'Current Age', fireAge: 'Target FIRE Age', deathAge: 'Life Expectancy', annualWithdraw: 'Annual Withdrawal',
      currentSavings: 'Current Savings', yieldRate: 'Yield Rate (R)', investReturn: 'Market Return (r)', targetHeader: 'Required FIRE Capital', planHeader: 'Plan (Monthly Investment Needed)',
      formulaPV: 'Formula (Present Value of Annuity):', targetDesc: 'Target = Annual Withdrawal × (1+R) × PV Factor', formulaFV: 'Formula (Future Value of Annuity):', planDesc: 'Monthly Need = Shortfall / FV Factor'
    },
    regular: {
      paramsTitle: 'Parameters', monthlyInvest: 'Monthly Investment', annualRate: 'Expected Annual Return (r%)', years: 'Investment Years (n)', resultTitle: 'Expected Accumulated Value',
      formulaTitle: 'Formula (Future Value FV):', moRateText: 'Monthly Rate', totalPeriods: 'Total Periods', monthsText: 'months', formulaDesc: 'Total Value = Monthly Investment × FV Factor'
    }
  }
};

const categories = ['food', 'clothing', 'housing', 'transport', 'education', 'fun', 'medical', 'misc', 'tax'];
const freqMap = { day: 365, week: 52, month: 12, bimonth: 6, quarter: 4, year: 1 };
const generateId = () => Math.random().toString(36).substring(2, 9);
const format = (num) => isNaN(num) || num < 0 ? '0' : Math.round(num).toLocaleString('en-US');

export default function App() {
  const [currentTab, setCurrentTab] = useState('budget');
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('zh');

  const t = (path) => {
    return path.split('.').reduce((obj, key) => obj && obj[key], messages[lang]) || path;
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // --- React Portal 客製下拉選單組件 ---
  const [activeDropdown, setActiveDropdown] = useState(null); // { id, type, targetType, coords }

  useEffect(() => {
    const handleGlobalClick = () => setActiveDropdown(null);
    if (activeDropdown) document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [activeDropdown]);

  const toggleDropdown = (id, type, targetType, e) => {
    e.stopPropagation();
    if (activeDropdown?.id === id && activeDropdown?.type === type) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveDropdown({
      id, type, targetType,
      coords: { top: rect.bottom + 6, left: rect.left, minWidth: rect.width }
    });
  };

  // 1. Budget State
  const [needs, setNeeds] = useState([
    { id: generateId(), categoryKey: 'food', item: '每日三餐', freqKey: 'day', amount: 600 },
    { id: generateId(), categoryKey: 'housing', item: '房租、管理費', freqKey: 'month', amount: 20000 }
  ]);
  const [wants, setWants] = useState([
    { id: generateId(), categoryKey: 'fun', item: '出國旅遊', freqKey: 'year', amount: 80000 }
  ]);

  const totalNeeds = useMemo(() => needs.reduce((acc, cur) => acc + (Math.max(0, cur.amount || 0) * freqMap[cur.freqKey]), 0), [needs]);
  const totalWants = useMemo(() => wants.reduce((acc, cur) => acc + (Math.max(0, cur.amount || 0) * freqMap[cur.freqKey]), 0), [wants]);

  const updateItem = (targetType, id, field, value) => {
    const setFn = targetType === 'needs' ? setNeeds : setWants;
    setFn(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (targetType, id) => {
    const setFn = targetType === 'needs' ? setNeeds : setWants;
    setFn(prev => prev.filter(item => item.id !== id));
  };

  // 2. FIRE State
  const [showFireGuide, setShowFireGuide] = useState(false);
  const [fire, setFire] = useState({ currentAge: 28, fireAge: 55, deathAge: 80, annualWithdraw: 840000, currentSavings: 600000, yieldRate: 5.0, investReturn: 7.0 });

  const fireCalc = useMemo(() => {
    if (fire.fireAge <= fire.currentAge || fire.deathAge <= fire.fireAge) {
      return { pvFactor: 0, target: 0, fvFactor: 0, monthlyNeeded: 0 };
    }
    const n = fire.fireAge - fire.currentAge;
    const N = fire.deathAge - fire.fireAge;
    const R = Math.max(0.001, fire.yieldRate / 100);
    const pvFactor = (1 - Math.pow(1 + R, -N)) / R;
    const target = Math.max(0, fire.annualWithdraw) * (1 + R) * pvFactor;
    const r = Math.max(0, fire.investReturn / 100);
    const currentFV = Math.max(0, fire.currentSavings) * Math.pow(1 + r, n);
    const shortfall = Math.max(0, target - currentFV);
    const months = n * 12;
    const rMonth = r / 12;
    const fvFactor = rMonth === 0 ? months : (Math.pow(1 + rMonth, months) - 1) / rMonth;
    const monthlyNeeded = fvFactor === 0 ? 0 : shortfall / fvFactor;
    return { pvFactor, target, fvFactor, monthlyNeeded };
  }, [fire]);

  // 3. Regular State
  const [regular, setRegular] = useState({ monthly: 10000, rate: 7.0, years: 30 });
  const regularCalc = useMemo(() => {
    const months = Math.max(0, regular.years) * 12;
    const rMonth = Math.max(0, regular.rate / 100) / 12;
    const fvFactor = rMonth === 0 ? months : (Math.pow(1 + rMonth, months) - 1) / rMonth;
    const totalValue = Math.max(0, regular.monthly) * fvFactor;
    return { fvFactor, totalValue };
  }, [regular]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 mt-2 md:mt-4">
      {/* 頂部 Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 relative z-20">
        <div className="flex overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0 order-2 md:order-1">
          <div className="mx-auto md:mx-0 w-max bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-1.5 rounded-full flex flex-nowrap gap-1 shadow-sm">
            {['budget', 'fire', 'regular'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveDropdown(null); setCurrentTab(tab); }}
                className={`whitespace-nowrap px-5 md:px-6 py-2.5 rounded-full transition-all duration-300 text-sm md:text-base ${
                  currentTab === tab ? 'bg-white dark:bg-white/20 shadow-sm text-indigo-800 dark:text-indigo-100 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50'
                }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 order-1 md:order-2 w-full md:w-auto justify-end px-2 md:px-0">
          <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/80 dark:border-white/10 flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-sm font-bold text-indigo-900 dark:text-indigo-200">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button onClick={() => setIsDark(d => !d)} className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/80 dark:border-white/10 flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-indigo-900 dark:text-indigo-200">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* 主內容卡片 */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/70 dark:border-white/10 shadow-xl rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-6 md:p-10 relative">
        {currentTab === 'budget' && (
          <div className="space-y-6 md:space-y-8">
            {/* 參考指南 */}
            <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center text-sm shadow-sm">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-base shrink-0 flex items-center gap-2">
                <span className="bg-yellow-400/30 text-yellow-700 dark:text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center font-black">i</span>
                {t('budget.refTitle')}
              </div>
              <div className="w-px h-8 bg-indigo-200/50 hidden md:block"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 w-full text-gray-700 dark:text-gray-300 font-medium">
                {categories.map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <span className="bg-indigo-100/60 dark:bg-indigo-900/60 p-1 rounded px-2">{t(`categories.${c}`)}</span>
                    <span className="text-xs opacity-80">{t(`refDesc.${c}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 總結 */}
            <div className="bg-white/60 dark:bg-black/50 backdrop-blur-3xl border border-white/80 dark:border-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-center text-indigo-950 dark:text-indigo-100 bg-white/70 dark:bg-black/60 inline-block px-6 py-2 rounded-full border border-white/80 shadow-sm mx-auto flex w-max">{t('budget.summaryTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
                <div className="bg-white/70 dark:bg-black/40 border border-white/90 dark:border-white/10 p-5 md:p-6 rounded-2xl shadow-sm">
                  <div className="text-indigo-700 dark:text-indigo-300 font-bold text-sm mb-2">{t('budget.needs')}</div>
                  <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100">${format(totalNeeds)}</div>
                </div>
                <div className="bg-white/70 dark:bg-black/40 border border-white/90 dark:border-white/10 p-5 md:p-6 rounded-2xl shadow-sm">
                  <div className="text-purple-700 dark:text-purple-300 font-bold text-sm mb-2">{t('budget.wants')}</div>
                  <div class="text-3xl font-black text-purple-900 dark:text-purple-100">${format(totalWants)}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 p-5 md:p-6 rounded-2xl shadow-md text-white md:scale-105">
                  <div className="text-indigo-100 font-medium text-sm mb-1">{t('budget.totalBudget')}</div>
                  <div className="text-3xl md:text-4xl font-black mb-2">${format(totalNeeds + totalWants)}</div>
                  <div className="text-xs md:text-sm font-bold text-indigo-950 bg-white/90 inline-block px-3 py-1.5 rounded-full">{t('budget.monthlyAvg')}: ${format((totalNeeds + totalWants) / 12)}</div>
                </div>
              </div>
            </div>

            {/* 表格區 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {['needs', 'wants'].map(type => {
                const isNeeds = type === 'needs';
                const list = isNeeds ? needs : wants;
                return (
                  <div key={type} className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 md:p-6 rounded-[1.25rem] shadow-sm">
                    <h3 className={`text-lg font-bold mb-4 ${isNeeds ? 'text-indigo-900 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-900/60' : 'text-purple-900 dark:text-purple-200 bg-purple-100/70 dark:bg-purple-900/60'} inline-block px-4 py-1.5 rounded-lg`}>
                      {t(`budget.${type}`)}
                    </h3>
                    <div className="overflow-x-auto hide-scrollbar">
                      <table className="w-full min-w-[560px] table-fixed text-sm text-left border-collapse">
                        <thead>
                          <tr className="text-gray-600 dark:text-gray-400 border-b border-indigo-200/50">
                            <th className="pb-3 w-[24%] font-bold">{t('budget.category')}</th>
                            <th className="pb-3 w-[26%] font-bold">{t('budget.item')}</th>
                            <th className="pb-3 w-[16%] font-bold">{t('budget.freq')}</th>
                            <th className="pb-3 w-[22%] font-bold text-right">{t('budget.amount')}</th>
                            <th className="pb-3 w-[12%] text-right font-bold">{t('budget.annual')}</th>
                            <th className="pb-3 w-[6%]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map(item => (
                            <tr key={item.id} className="border-b border-indigo-100/40 dark:border-indigo-900/30">
                              <td className="py-2.5 pr-2">
                                <div onClick={(e) => toggleDropdown(item.id, 'cat', type, e)} className="w-full p-2.5 bg-white/80 dark:bg-black/60 border border-white dark:border-white/20 rounded-xl cursor-pointer flex justify-between items-center hover:bg-white font-bold text-indigo-950 dark:text-indigo-100">
                                  <span className="truncate">{t(`categories.${item.categoryKey}`)}</span>
                                  <span className="text-xs">▼</span>
                                </div>
                              </td>
                              <td className="py-2.5 pr-2">
                                <input type="text" value={item.item} onChange={e => updateItem(type, item.id, 'item', e.target.value)} className="w-full p-2.5 bg-white/80 dark:bg-black/60 border border-white dark:border-white/20 rounded-xl font-bold text-indigo-950 dark:text-indigo-100 outline-none" />
                              </td>
                              <td className="py-2.5 pr-2">
                                <div onClick={(e) => toggleDropdown(item.id, 'freq', type, e)} className="w-full p-2.5 bg-white/80 dark:bg-black/60 border border-white dark:border-white/20 rounded-xl cursor-pointer flex justify-between items-center hover:bg-white font-bold text-indigo-950 dark:text-indigo-100">
                                  <span>{t(`freqs.${item.freqKey}`)}</span>
                                  <span className="text-xs">▼</span>
                                </div>
                              </td>
                              <td className="py-2.5 pr-2">
                                <input type="number" min="0" value={item.amount} onChange={e => updateItem(type, item.id, 'amount', Number(e.target.value))} className="w-full p-2.5 bg-white/80 dark:bg-black/60 border border-white dark:border-white/20 rounded-xl text-right font-bold text-indigo-950 dark:text-indigo-100 outline-none" />
                              </td>
                              <td className="py-2.5 text-right font-black text-indigo-900 dark:text-indigo-100 truncate">
                                {format(item.amount * freqMap[item.freqKey])}
                              </td>
                              <td className="py-2.5 text-center">
                                <button onClick={() => removeItem(type, item.id)} className="p-2 text-gray-400 hover:text-rose-600">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => (isNeeds ? setNeeds : setWants)(prev => [...prev, { id: generateId(), categoryKey: 'food', item: '', freqKey: 'month', amount: 0 }])} className="w-full mt-4 py-3 bg-white/60 dark:bg-black/50 border border-white text-indigo-700 dark:text-indigo-300 rounded-xl font-bold">
                      + {t(`budget.add${isNeeds ? 'Need' : 'Want'}`)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FIRE 計算機 */}
        {currentTab === 'fire' && (
          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-4 md:p-5 shadow-sm">
              <div onClick={() => setShowFireGuide(!showFireGuide)} className="cursor-pointer flex justify-between items-center select-none font-bold text-indigo-950 dark:text-indigo-200">
                <span className="flex items-center gap-2"><span className="bg-indigo-500/20 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center font-black">?</span>{t('fireGuide.title')}</span>
                <span className="text-xs text-indigo-600">{showFireGuide ? t('fireGuide.collapse') : t('fireGuide.expand')}</span>
              </div>
              {showFireGuide && (
                <div className="mt-4 pt-4 border-t border-indigo-100 space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['step1', 'step2', 'step3'].map(step => (
                      <div key={step} className="bg-white/50 dark:bg-black/30 p-3.5 rounded-xl border border-indigo-50">
                        <h5 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">{t(`fireGuide.${step}Title`)}</h5>
                        <p className="text-xs opacity-80">{t(`fireGuide.${step}Desc`)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50/70 dark:bg-indigo-950/50 p-4 rounded-xl border border-indigo-200 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                      <div className="font-bold text-indigo-950 dark:text-indigo-100 text-sm">📌 {t('fireGuide.exampleTitle')}</div>
                      <div className="text-xs opacity-90">{t('fireGuide.exampleDesc')}</div>
                    </div>
                    <button onClick={() => setFire({ currentAge: 28, fireAge: 55, deathAge: 80, annualWithdraw: 840000, currentSavings: 600000, yieldRate: 5.0, investReturn: 7.0 })} className="whitespace-nowrap px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">
                      👉 {t('fireGuide.loadExampleBtn')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/80 dark:border-white/10 p-6 rounded-[1.5rem] space-y-6">
                <div>
                  <h3 className="text-lg font-bold border-b pb-3 mb-5 text-indigo-950 dark:text-indigo-200">{t('fire.goalTitle')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[['currentAge', 'age'], ['fireAge', 'age'], ['deathAge', 'age'], ['annualWithdraw', 'currency']].map(([key, unit]) => (
                      <div key={key}>
                        <label className="block text-sm font-bold mb-2 text-indigo-950 dark:text-indigo-200">{t(`fire.${key}`)}</label>
                        <div className="relative">
                          <input type="number" min="0" value={fire[key]} onChange={e => setFire({ ...fire, [key]: Number(e.target.value) })} className="w-full p-3.5 pr-14 bg-white/80 dark:bg-black/60 border rounded-xl text-right font-black text-indigo-950 dark:text-indigo-100" />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-sm pointer-events-none">{t(`units.${unit}`)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold border-b pb-3 mb-5 text-indigo-950 dark:text-indigo-200">{t('fire.planTitle')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[['currentSavings', 'currency'], ['yieldRate', '%'], ['investReturn', '%']].map(([key, unit]) => (
                      <div key={key}>
                        <label className="block text-sm font-bold mb-2 text-indigo-950 dark:text-indigo-200">{t(`fire.${key}`)}</label>
                        <div className="relative">
                          <input type="number" min="0" step="0.1" value={fire[key]} onChange={e => setFire({ ...fire, [key]: Number(e.target.value) })} className="w-full p-3.5 pr-14 bg-white/80 dark:bg-black/60 border rounded-xl text-right font-black text-indigo-950 dark:text-indigo-100" />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-sm pointer-events-none">{unit === '%' ? '%' : t(`units.${unit}`)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-center">
                <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border p-6 rounded-[1.5rem]">
                  <h4 class="text-sm font-black text-blue-700 dark:text-blue-400 mb-2 uppercase">{t('fire.targetHeader')}</h4>
                  <div className="text-3xl md:text-5xl font-black text-indigo-950 dark:text-indigo-100 mb-4">${format(fireCalc.target)}</div>
                  <div className="font-mono bg-white/80 dark:bg-black/40 p-4 rounded-xl text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <p className="font-black mb-1">{t('fire.formulaPV')}</p>
                    <p>PV = (1 - (1+R)^-N) / R = {fireCalc.pvFactor.toFixed(2)}</p>
                    <p>{t('fire.targetDesc')}</p>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl border p-6 rounded-[1.5rem]">
                  <h4 className="text-sm font-black text-purple-700 dark:text-purple-400 mb-2 uppercase">{t('fire.planHeader')}</h4>
                  <div className="text-3xl md:text-5xl font-black text-purple-950 dark:text-purple-100 mb-4">${format(fireCalc.monthlyNeeded)}</div>
                  <div className="font-mono bg-white/80 dark:bg-black/40 p-4 rounded-xl text-xs font-bold text-purple-950 dark:text-purple-200">
                    <p className="font-black mb-1">{t('fire.formulaFV')}</p>
                    <p>FV = ((1+Mo.Rate)^n - 1) / Mo.Rate = {fireCalc.fvFactor.toFixed(2)}</p>
                    <p>{t('fire.planDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 定期定額計算機 */}
        {currentTab === 'regular' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/80 dark:border-white/10 p-6 md:p-10 rounded-[1.5rem] flex flex-col justify-center space-y-6">
              <h3 className="text-xl font-bold border-b pb-4 mb-2 text-indigo-950 dark:text-indigo-200">{t('regular.paramsTitle')}</h3>
              {[['monthly', 'monthlyInvest', 'currency'], ['rate', 'annualRate', '%'], ['years', 'years', 'year']].map(([key, labelKey, unit]) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-indigo-950 dark:text-indigo-300 mb-2">{t(`regular.${labelKey}`)}</label>
                  <div className="relative">
                    <input type="number" min="0" step={key === 'rate' ? '0.1' : '1'} value={regular[key]} onChange={e => setRegular({ ...regular, [key]: Number(e.target.value) })} className="w-full p-4 pr-14 bg-white/80 dark:bg-black/60 border rounded-xl text-right font-black text-indigo-950 dark:text-indigo-100 text-lg" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 font-bold text-sm pointer-events-none">{unit === '%' ? '%' : t(`units.${unit}`)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 p-6 md:p-10 rounded-[1.5rem] shadow-xl text-center h-full flex flex-col justify-center text-white">
                <h4 className="text-sm md:text-lg font-bold text-indigo-100 mb-2 uppercase">{t('regular.resultTitle')}</h4>
                <div className="text-4xl md:text-6xl font-black mb-6 tracking-tight">${format(regularCalc.totalValue)}</div>
                <div className="text-xs md:text-sm text-left font-mono bg-black/30 p-4 rounded-xl border border-white/20 text-indigo-100">
                  <strong className="text-white mb-2 block">{t('regular.formulaTitle')}</strong>
                  <p>{t('regular.moRateText')} = {(regular.rate/12).toFixed(3)}% | {t('regular.totalPeriods')} = {regular.years * 12} {t('regular.monthsText')}</p>
                  <p className="mt-2 font-bold">{t('regular.formulaDesc')} ({regularCalc.fvFactor.toFixed(2)})</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* React Portal 全域絕對選單 */}
      {activeDropdown && createPortal(
        <div
          onClick={e => e.stopPropagation()}
          style={{ top: `${activeDropdown.coords.top}px`, left: `${activeDropdown.coords.left}px`, minWidth: `${activeDropdown.coords.minWidth}px` }}
          className="global-dropdown-portal bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-indigo-200 dark:border-indigo-800 rounded-xl overflow-hidden py-1"
        >
          {activeDropdown.type === 'cat' ? (
            categories.map(c => (
              <div
                key={c}
                onClick={() => {
                  updateItem(activeDropdown.targetType, activeDropdown.id, 'categoryKey', c);
                  setActiveDropdown(null);
                }}
                className="px-4 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer text-indigo-950 dark:text-indigo-100 font-bold transition-colors"
              >
                {t(`categories.${c}`)}
              </div>
            ))
          ) : (
            Object.keys(freqMap).map(key => (
              <div
                key={key}
                onClick={() => {
                  updateItem(activeDropdown.targetType, activeDropdown.id, 'freqKey', key);
                  setActiveDropdown(null);
                }}
                className="px-4 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer text-indigo-950 dark:text-indigo-100 font-bold transition-colors"
              >
                {t(`freqs.${key}`)}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}