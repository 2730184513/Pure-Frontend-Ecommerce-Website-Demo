/**
 * Location Repository - Global Singleton
 * Pure data access layer for countries and provinces/states
 * Provides query methods for location data filtering
 */

class LocationRepository {
    constructor() {
        this.countries = [];
        this.states = [];
        // 首字母索引：key为首字母，value为国家名称数组
        this.countriesByFirstLetter = new Map();
        // 省份索引：key为国家名称，value为省份数组
        this.statesByCountryName = new Map();
        this.dataLoaded = false;
        this.dataPath = 'data/';
    }

    /**
     * Load location data from JSON files
     * @returns {Promise<void>}
     */
    async loadData() {
        if (this.dataLoaded) {
            return;
        }

        try {
            const [countriesResponse, statesResponse] = await Promise.all([
                fetch(`${this.dataPath}countries.json`),
                fetch(`${this.dataPath}states.json`)
            ]);

            if (!countriesResponse.ok || !statesResponse.ok) {
                throw new Error('Failed to load location data');
            }

            const [countriesData, statesData] = await Promise.all([
                countriesResponse.json(),
                statesResponse.json()
            ]);

            this.countries = countriesData;
            this.states = statesData;

            // Build first letter index for countries
            this.countries.forEach(country => {
                const firstLetter = country.name[0].toUpperCase();
                if (!this.countriesByFirstLetter.has(firstLetter)) {
                    this.countriesByFirstLetter.set(firstLetter, []);
                }
                this.countriesByFirstLetter.get(firstLetter).push(country.name);
            });

            // Build states by country index
            this.states.forEach(state => {
                const countryName = state.country_name;
                if (!this.statesByCountryName.has(countryName)) {
                    this.statesByCountryName.set(countryName, []);
                }
                this.statesByCountryName.get(countryName).push(state.name);
            });

            this.dataLoaded = true;
            console.log(`✓ LocationRepository loaded ${this.countries.length} countries and ${this.states.length} states`);
        } catch (error) {
            console.error('✗ Error loading location data:', error);
            throw error;
        }
    }

    /**
     * Search countries with keyword prefix matching
     * @param {string} keyword - Search keyword
     * @returns {Array} Array of matching country names
     */
    searchCountries(keyword) {
        if (!keyword || !this.dataLoaded) {
            return [];
        }

        const firstLetter = keyword[0].toUpperCase();
        const countries = this.countriesByFirstLetter.get(firstLetter) || [];

        // Prefix matching (case insensitive)
        return countries.filter(country =>
            country.toLowerCase().startsWith(keyword.toLowerCase())
        );
    }

    /**
     * Get provinces/states by country name
     * @param {string} countryName - Country name
     * @returns {Array} Array of province/state names
     */
    getProvincesByCountry(countryName) {
        if (!countryName || !this.dataLoaded) {
            return [];
        }

        return this.statesByCountryName.get(countryName) || [];
    }

    /**
     * Filter countries by keyword (alias for searchCountries for consistency)
     * @param {string} keyword - Search keyword
     * @returns {Array} Array of matching country names
     */
    filterCountries(keyword) {
        return this.searchCountries(keyword);
    }

    /**
     * Get all countries
     * @returns {Array} Array of all countries
     */
    getAllCountries() {
        return this.countries.map(country => country.name);
    }

    /**
     * Get all states/provinces
     * @returns {Array} Array of all states
     */
    getAllStates() {
        return this.states.map(state => state.name);
    }

    /**
     * Clear data (for testing/reset purposes)
     */
    clear() {
        this.countries = [];
        this.states = [];
        this.countriesByFirstLetter.clear();
        this.statesByCountryName.clear();
        this.dataLoaded = false;
    }
}

// Create and expose global singleton instance
if (typeof window !== 'undefined') {
    window.LocationRepository = LocationRepository;
    window.locationRepository = new LocationRepository();
}
