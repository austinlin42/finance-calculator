const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const messages = {
    zh: {
        tabs: { budget: '1. 預算規劃工具', fire: '2. 財富自由計算機', regular: '3. 定期定額計算機' },
        budget: {
            refTitle: '填寫參考指南',
            summaryTitle: '年度預算總結', needs: '生存 / 需要 (Needs)', wants: '生活 / 想要 (Wants)',
            totalBudget: '總年度預算 (Avg/月)', monthlyAvg: '每月約',
            category: '類別', item: '項目', freq: '頻率', amount: '金額', annual: '年花費',
            addNeed: '新增需要項目', addWant: '新增想要項目'
        },
        refDesc: {
            food: '三餐/聚餐', clothing: '衣物/保養', housing: '水電/房租', transport: '通勤/油資',
            education: '學費/書籍', fun: '影音/旅遊', medical: '就醫/保健', misc: '禮物/雜項', tax: '所得/保險'
        },
        categories: { food: '🍔 食', clothing: '👕 衣', housing: '🏠 住', transport: '🚗 行', education: '📚 育', fun: '🎮 樂', medical: '💊 醫', misc: '🎁 雜', tax: '📄 稅' },
        freqs: { day: '日', week: '週', month: '月', bimonth: '雙月', quarter: '季', year: '年' },
        units: { age: '歲', currency: '元', year: '年' },
        fireGuide: {
            title: '使用說明與情境範例 Guide & Examples',
            expand: '展開指南', collapse: '收起指南',
            step1Title: '設定年齡與年花費', step1Desc: '填入目前與預計退休年齡，並估算退休後每年生活費（可參考工具一的總預算）。',
            step2Title: '預期殖利率 (R)', step2Desc: '退休後提領資產的年化回報率，歷史經驗約填 4% ~ 5%（安全提領率）。',
            step3Title: '大盤年化報酬 (r)', step3Desc: '退休前累積期投資大盤ETF（如 VT/VOO）的預期年化報酬率，歷史平均約填 7% ~ 8%。',
            exampleTitle: '實例：28 歲小明目標 55 歲退休',
            exampleDesc: '目前資產 60 萬元，預計活到 80 歲，退休後每月花費 7 萬元（每年 84 萬）。大盤報酬 7%、退休殖利率 5%。算出來每月需定期定額投入 $9,093 元即可達標！',
            loadExampleBtn: '帶入此範例數據'
        },
        fire: {
            goalTitle: '目標設定', planTitle: 'Plan (達成計畫)',
            currentAge: '我今年幾歲', fireAge: '預計FIRE退休年齡', deathAge: '預計活到幾歲', annualWithdraw: '退休後每年提領',
            currentSavings: '目前已備資產', yieldRate: '預期殖利率 (R)', investReturn: '大盤年化報酬 (r)',
            targetHeader: '財富自由需要累積', planHeader: '計畫（每月需定期定額）',
            formulaPV: '公式推導 (期初現值):', targetDesc: '目標 = 每年提領 × (1+R) × PV',
            formulaFV: '公式推導 (年金終值):', planDesc: '每月需存 = 資金缺口 / FV'
        },
        regular: {
            paramsTitle: '參數設定', monthlyInvest: '每月定期定額投入', annualRate: '預期年化報酬率 (r%)', years: '預計持續年數 (n)',
            resultTitle: '預期累積金額', formulaTitle: '公式推導 (年金終值 FV)：', moRateText: '月利率', totalPeriods: '總期數', monthsText: '個月', formulaDesc: '累積金額 = 每月投入 × 終值係數'
        }
    },
    en: {
        tabs: { budget: '1. Budget Planner', fire: '2. FIRE Calculator', regular: '3. Regular Investment' },
        budget: {
            refTitle: 'Filling Reference Guide',
            summaryTitle: 'Annual Budget Summary', needs: 'Needs', wants: 'Wants',
            totalBudget: 'Total Annual Budget (Avg/Mo)', monthlyAvg: 'Monthly ~',
            category: 'Category', item: 'Item', freq: 'Freq.', amount: 'Amount', annual: 'Annual',
            addNeed: 'Add Need', addWant: 'Add Want'
        },
        refDesc: {
            food: 'Meals', clothing: 'Apparel', housing: 'Rent/Utilities', transport: 'Commute',
            education: 'Tuition/Books', fun: 'Travel/Media', medical: 'Healthcare', misc: 'Gifts/Misc', tax: 'Tax/Insurance'
        },
        categories: { food: '🍔 Food', clothing: '👕 Cloth', housing: '🏠 House', transport: '🚗 Trans', education: '📚 Edu', fun: '🎮 Fun', medical: '💊 Med', misc: '🎁 Misc', tax: '📄 Tax' },
        freqs: { day: 'Day', week: 'Week', month: 'Month', bimonth: 'Bi-Mo', quarter: 'Qtr', year: 'Year' },
        units: { age: 'yo', currency: 'NT$', year: 'Yrs' },
        fireGuide: {
            title: 'Guide & Scenario Examples',
            expand: 'Show Guide', collapse: 'Hide Guide',
            step1Title: 'Set Age & Withdrawal', step1Desc: 'Enter current & retirement age. Estimate annual retirement expenses (refer to Budget Tool).',
            step2Title: 'Yield Rate (R)', step2Desc: 'Expected return rate during retirement. Historically 4% ~ 5% is safe.',
            step3Title: 'Market Return (r)', step3Desc: 'Expected return on index ETFs (e.g., VOO/VT) during accumulation phase, typically ~7% - 8%.',
            exampleTitle: 'Example: 28yo Alex targets FIRE at 55',
            exampleDesc: 'Current savings $600k NTD, life expectancy 80yo. Desired retirement spending $70k/mo ($840k/yr). Market return 7%, yield 5%. Required monthly saving is only $9,093 NTD!',
            loadExampleBtn: 'Load Example Scenario'
        },
        fire: {
            goalTitle: 'Goal Settings', planTitle: 'Plan',
            currentAge: 'Current Age', fireAge: 'Target FIRE Age', deathAge: 'Life Expectancy', annualWithdraw: 'Annual Withdrawal',
            currentSavings: 'Current Savings', yieldRate: 'Yield Rate (R)', investReturn: 'Market Return (r)',
            targetHeader: 'Required FIRE Capital', planHeader: 'Plan (Monthly Investment Needed)',
            formulaPV: 'Formula (Present Value of Annuity):', targetDesc: 'Target = Annual Withdrawal × (1+R) × PV Factor',
            formulaFV: 'Formula (Future Value of Annuity):', planDesc: 'Monthly Need = Shortfall / FV Factor'
        },
        regular: {
            paramsTitle: 'Parameters', monthlyInvest: 'Monthly Investment', annualRate: 'Expected Annual Return (r%)', years: 'Investment Years (n)',
            resultTitle: 'Expected Accumulated Value', formulaTitle: 'Formula (Future Value FV):', moRateText: 'Monthly Rate', totalPeriods: 'Total Periods', monthsText: 'months', formulaDesc: 'Total Value = Monthly Investment × FV Factor'
        }
    }
};

createApp({
    setup() {
        const currentTab = ref('budget');
        const format = (num) => isNaN(num) || num < 0 ? '0' : Math.round(num).toLocaleString('en-US');
        const generateId = () => Math.random().toString(36).substring(2, 9);

        // 深淺色
        const isDark = ref(false);
        const toggleTheme = () => {
            isDark.value = !isDark.value;
            if (isDark.value) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        };

        // 語系
        const lang = ref('zh');
        const toggleLang = () => { lang.value = lang.value === 'zh' ? 'en' : 'zh'; };
        const t = (path) => {
            return path.split('.').reduce((obj, key) => obj && obj[key], messages[lang.value]) || path;
        };

        // Tab 切換
        const switchTab = (tab) => {
            closeDropdown();
            currentTab.value = tab;
        };

        // FIRE 指南開關與資料帶入
        const showFireGuide = ref(false);
        const loadFireExample = () => {
            fire.value = {
                currentAge: 28,
                fireAge: 55,
                deathAge: 80,
                annualWithdraw: 840000,
                currentSavings: 600000,
                yieldRate: 5.0,
                investReturn: 7.0
            };
        };

        // 下拉選單邏輯
        const activeDropdown = ref(null);
        const dropdownStyle = ref({});

        const toggleDropdown = (id, type, event, targetType = 'needs') => {
            if (activeDropdown.value && activeDropdown.value.id === id && activeDropdown.value.type === type) {
                closeDropdown();
                return;
            }
            const el = event.currentTarget;
            if (el) {
                const rect = el.getBoundingClientRect();
                dropdownStyle.value = {
                    top: (rect.bottom + 6) + 'px',
                    left: rect.left + 'px',
                    minWidth: rect.width + 'px'
                };
            }
            activeDropdown.value = { id, type, targetType };
        };

        const closeDropdown = () => { activeDropdown.value = null; };

        const handleGlobalClick = (e) => {
            if (activeDropdown.value) {
                const isTrigger = e.target.closest('.dropdown-trigger');
                const isMenu = e.target.closest('.dropdown-menu');
                if (!isTrigger && !isMenu) {
                    closeDropdown();
                }
            }
        };

        onMounted(() => { document.addEventListener('click', handleGlobalClick); });
        onUnmounted(() => { document.removeEventListener('click', handleGlobalClick); });

        const selectCategory = (c) => {
            if (!activeDropdown.value) return;
            const { id, targetType } = activeDropdown.value;
            const targetList = targetType === 'wants' ? wants.value : needs.value;
            const item = targetList.find(i => i.id === id);
            if (item) item.categoryKey = c;
            closeDropdown();
        };

        const selectFreq = (key) => {
            if (!activeDropdown.value) return;
            const { id, targetType } = activeDropdown.value;
            const targetList = targetType === 'wants' ? wants.value : needs.value;
            const item = targetList.find(i => i.id === id);
            if (item) item.freqKey = key;
            closeDropdown();
        };

        const categories = ['food', 'clothing', 'housing', 'transport', 'education', 'fun', 'medical', 'misc', 'tax'];
        const freqMap = { day: 365, week: 52, month: 12, bimonth: 6, quarter: 4, year: 1 };
        
        const needs = ref([
            { id: generateId(), categoryKey: 'food', item: '每日三餐', freqKey: 'day', amount: 600 },
            { id: generateId(), categoryKey: 'housing', item: '房租、管理費', freqKey: 'month', amount: 20000 }
        ]);
        const wants = ref([
            { id: generateId(), categoryKey: 'fun', item: '出國旅遊', freqKey: 'year', amount: 80000 }
        ]);

        const totalNeeds = computed(() => needs.value.reduce((acc, cur) => acc + (Math.max(0, cur.amount) * freqMap[cur.freqKey]), 0));
        const totalWants = computed(() => wants.value.reduce((acc, cur) => acc + (Math.max(0, cur.amount) * freqMap[cur.freqKey]), 0));

        const fire = ref({ currentAge: 28, fireAge: 55, yieldRate: 5.0, annualWithdraw: 840000, deathAge: 80, currentSavings: 600000, investReturn: 7.0 });
        const fireErrors = computed(() => {
            const errs = {};
            if (fire.value.fireAge <= fire.value.currentAge) errs.age = 'Invalid Age';
            if (fire.value.deathAge <= fire.value.fireAge) errs.death = 'Invalid Age';
            return errs;
        });
        const fireCalc = computed(() => {
            if (Object.keys(fireErrors.value).length > 0) return { n: 0, N: 0, pvFactor: 0, target: 0, currentFV: 0, shortfall: 0, fvFactor: 0, monthlyNeeded: 0 };
            const n = fire.value.fireAge - fire.value.currentAge;
            const N = fire.value.deathAge - fire.value.fireAge;
            const R = Math.max(0.001, fire.value.yieldRate / 100);
            const pvFactor = (1 - Math.pow(1 + R, -N)) / R;
            const target = Math.max(0, fire.value.annualWithdraw) * (1 + R) * pvFactor;
            const r = Math.max(0, fire.value.investReturn / 100);
            const currentFV = Math.max(0, fire.value.currentSavings) * Math.pow(1 + r, n);
            const shortfall = Math.max(0, target - currentFV);
            const months = n * 12;
            const rMonth = r / 12;
            const fvFactor = rMonth === 0 ? months : (Math.pow(1 + rMonth, months) - 1) / rMonth;
            const monthlyNeeded = fvFactor === 0 ? 0 : shortfall / fvFactor;
            return { n, N, pvFactor, target, currentFV, shortfall, fvFactor, monthlyNeeded };
        });

        const regular = ref({ monthly: 10000, rate: 7.0, years: 30 });
        const regularCalc = computed(() => {
            const months = Math.max(0, regular.value.years) * 12;
            const rMonth = Math.max(0, regular.value.rate / 100) / 12;
            const fvFactor = rMonth === 0 ? months : (Math.pow(1 + rMonth, months) - 1) / rMonth;
            const totalValue = Math.max(0, regular.value.monthly) * fvFactor;
            return { fvFactor, totalValue };
        });

        return {
            currentTab, switchTab, format, generateId,
            isDark, toggleTheme, lang, toggleLang, t,
            showFireGuide, loadFireExample,
            activeDropdown, dropdownStyle, toggleDropdown, closeDropdown, selectCategory, selectFreq,
            categories, freqMap, needs, wants, totalNeeds, totalWants,
            fire, fireErrors, fireCalc, regular, regularCalc
        };
    }
}).mount('#app');
