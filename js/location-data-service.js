/**
 * LocationDataService - 简化的高性能数据服务
 * 使用首字母Map实现快速搜索
 */
class LocationDataService {
    constructor() {
        // 首字母索引：key为首字母，value为国家名称数组
        this.countriesByFirstLetter = new Map();
        // 省份索引：key为国家名称，value为省份数组
        this.statesByCountryName = new Map();
        this.initialized = false;
    }

    /**
     * 初始化数据
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const [countries, states] = await Promise.all([
                fetch('data/countries.json').then(r => r.json()),
                fetch('data/states.json').then(r => r.json())
            ]);

            // 构建首字母索引（JSON已排序，无需再次排序）
            countries.forEach(country => {
                const firstLetter = country.name[0].toUpperCase();
                if (!this.countriesByFirstLetter.has(firstLetter)) {
                    this.countriesByFirstLetter.set(firstLetter, []);
                }
                this.countriesByFirstLetter.get(firstLetter).push(country.name);
            });

            // 构建省份索引
            states.forEach(state => {
                const countryName = state.country_name;
                if (!this.statesByCountryName.has(countryName)) {
                    this.statesByCountryName.set(countryName, []);
                }
                this.statesByCountryName.get(countryName).push(state.name);
            });

            this.initialized = true;
            console.log(`Loaded ${countries.length} countries, ${states.length} states`);
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    /**
     * 搜索国家（首字母匹配）
     * @param {string} query - 用户输入（首字母大写，其余小写）
     * @returns {string[]} 匹配的国家名称数组
     */
    searchCountries(query) {
        if (!query) return [];

        const firstLetter = query[0].toUpperCase();
        const countries = this.countriesByFirstLetter.get(firstLetter) || [];

        // 最左匹配
        return countries.filter(country =>
            country.toLowerCase().startsWith(query.toLowerCase())
        );
    }

    /**
     * 获取指定国家的所有省份
     * @param {string} countryName - 国家名称
     * @returns {string[]} 省份名称数组
     */
    getStates(countryName) {
        return this.statesByCountryName.get(countryName) || [];
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.LocationDataService = LocationDataService;
}

