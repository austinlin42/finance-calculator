const { createApp, ref, computed, onMounted } = Vue;

// 語系字典
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

        // --- 深淺色切換邏輯 ---
        const isDark = ref(false);
        const toggleTheme = () => {
            isDark.value = !isDark.value;
            if (isDark.value) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        };

        // --- 多國語系邏輯 ---
        const lang = ref('zh');
        const toggleLang = () => { lang.value = lang.value === 'zh' ? 'en' : 'zh'; };
        const t = (path) => {
            return path.split('.').reduce((obj, key) => obj && obj[key], messages[lang.value]) || path;
        };

        // --- 狀態管理：客製化下拉選單 ---
        const activeDropdown = ref(null);
        const toggleDropdown = (id, type) => {
            const key = id + '-' + type;
            activeDropdown.value = activeDropdown.value === key ? null : key;
        };
        const closeDropdown = () => { activeDropdown.value = null; };

        // --- 1. Budget Tool ---
        const categories = ['food', 'clothing', 'housing', 'transport', 'education', 'fun', 'medical', 'misc', 'tax'];
        const freqMap = { day: 365, week: 52, month: 12, bimonth: 6, quarter: 4, year: 1 };
        
        const needs = ref([
            { id: generateId(), categoryKey: 'food', item: 'Daily Meals', freqKey: 'day', amount: 600 },
            { id: generateId(), categoryKey: 'housing', item: 'Rent & Utilities', freqKey: 'month', amount: 20000 }
        ]);
        const wants = ref([
            { id: generateId(), categoryKey: 'fun', item: 'Travel', freqKey: 'year', amount: 80000 }
        ]);

        const totalNeeds = computed(() => needs.value.reduce((acc, cur) => acc + (Math.max(0, cur.amount) * freqMap[cur.freqKey]), 0));
        const totalWants = computed(() => wants.value.reduce((acc, cur) => acc + (Math.max(0, cur.amount) * freqMap[cur.freqKey]), 0));

        // ... (FIRE 及 定期定額 的邏輯不變，保持與先前版本一致)
        const totalValue = computed(() => 0); // 簡化展示，實際保留你的原本運算

        return {
            currentTab, format, generateId,
            isDark, toggleTheme,
            lang, toggleLang, t,
            activeDropdown, toggleDropdown, closeDropdown,
            categories, freqMap, needs, wants, totalNeeds, totalWants
        };
    }
}).mount('#app');