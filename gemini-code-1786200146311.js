const { createApp, ref, computed } = Vue;

const messages = {
    zh: {
        tabs: { budget: '1. 預算規劃工具', fire: '2. 財富自由計算機', regular: '3. 定期定額計算機' },
        budget: {
            summaryTitle: '年度預算總結', needs: '生存 / 需要 (Needs)', wants: '生活 / 想要 (Wants)',
            totalBudget: '總年度預算 (Avg/月)', monthlyAvg: '每月約',
            category: '類別', item: '項目', freq: '頻率', amount: '金額', annual: '年花費',
            addNeed: '新增需要項目', addWant: '新增想要項目'
        },
        categories: { food: '🍔 食', clothing: '👕 衣', housing: '🏠 住', transport: '🚗 行', education: '📚 育', fun: '🎮 樂', medical: '💊 醫', misc: '🎁 雜', tax: '📄 稅' },
        freqs: { day: '日', week: '週', month: '月', bimonth: '雙月', quarter: '季', year: '年' }
    },
    en: {
        tabs: { budget: '1. Budget Planner', fire: '2. FIRE Calculator', regular: '3. Regular Investment' },
        budget: {
            summaryTitle: 'Annual Budget Summary', needs: 'Needs', wants: 'Wants',
            totalBudget: 'Total Annual Budget (Avg/Mo)', monthlyAvg: 'Monthly ~',
            category: 'Category', item: 'Item', freq: 'Freq.', amount: 'Amount', annual: 'Annual',
            addNeed: 'Add Need', addWant: 'Add Want'
        },
        categories: { food: '🍔 Food', clothing: '👕 Cloth', housing: '🏠 House', transport: '🚗 Trans', education: '📚 Edu', fun: '🎮 Fun', medical: '💊 Med', misc: '🎁 Misc', tax: '📄 Tax' },
        freqs: { day: 'Day', week: 'Week', month: 'Month', bimonth: 'Bi-Mo', quarter: 'Qtr', year: 'Year' }
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

        // 下拉選單狀態
        const activeDropdown = ref(null);
        const toggleDropdown = (id, type) => {
            const key = id + '-' + type;
            activeDropdown.value = activeDropdown.value === key ? null : key;
        };
        const closeDropdown = () => { activeDropdown.value = null; };

        // 1. Budget
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

        // 2. FIRE Calculator
        const fire = ref({ currentAge: 30, fireAge: 55, yieldRate: 5.0, annualWithdraw: 840000, deathAge: 80, currentSavings: 600000, investReturn: 7.0 });
        const fireErrors = computed(() => {
            const errs = {};
            if (fire.value.fireAge <= fire.value.currentAge) errs.age = '退休需大於目前';
            if (fire.value.deathAge <= fire.value.fireAge) errs.death = '壽命需大於退休';
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

        // 3. Regular Investment
        const regular = ref({ monthly: 10000, rate: 7.0, years: 30 });
        const regularCalc = computed(() => {
            const months = Math.max(0, regular.value.years) * 12;
            const rMonth = Math.max(0, regular.value.rate / 100) / 12;
            const fvFactor = rMonth === 0 ? months : (Math.pow(1 + rMonth, months) - 1) / rMonth;
            const totalValue = Math.max(0, regular.value.monthly) * fvFactor;
            return { fvFactor, totalValue };
        });

        return {
            currentTab, format, generateId,
            isDark, toggleTheme, lang, toggleLang, t,
            activeDropdown, toggleDropdown, closeDropdown,
            categories, freqMap, needs, wants, totalNeeds, totalWants,
            fire, fireErrors, fireCalc, regular, regularCalc
        };
    }
}).mount('#app');