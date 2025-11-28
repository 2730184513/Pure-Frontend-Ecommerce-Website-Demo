/**
 * Sort State Strategy - 封装排序状态的显示逻辑
 * 策略模式：将每种排序状态的行为封装到独立的策略对象中
 */

/**
 * 默认排序策略
 */
class DefaultSortStrategy {
    getSortMode() {
        return 'default';
    }

    getLabelText(key) {
        return 'Default';
    }

    getIconText() {
        return '';
    }

    isActive() {
        return false;
    }
}

/**
 * 升序排序策略
 */
class AscendingSortStrategy {
    getSortMode(key) {
        return `${key}-asc`;
    }

    getLabelText(key) {
        return `${this._capitalize(key)} (Asc)`;
    }

    getIconText() {
        return '↑';
    }

    isActive() {
        return true;
    }

    _capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}

/**
 * 降序排序策略
 */
class DescendingSortStrategy {
    getSortMode(key) {
        return `${key}-desc`;
    }

    getLabelText(key) {
        return `${this._capitalize(key)} (Desc)`;
    }

    getIconText() {
        return '↓';
    }

    isActive() {
        return true;
    }

    _capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}

/**
 * 策略工厂 - 根据状态码返回对应的策略实例
 */
class SortStateStrategy {
    /**
     * 获取排序状态策略
     * @param {number} state - 状态码 (0: default, 1: asc, 2: desc)
     * @returns {Object} 策略对象
     */
    static getStrategy(state) {
        const strategies = {
            0: new DefaultSortStrategy(),
            1: new AscendingSortStrategy(),
            2: new DescendingSortStrategy()
        };
        return strategies[state] || strategies[0];
    }
}

// 导出到全局命名空间（保持原接口名称）
if (typeof window !== 'undefined') {
    window.SortStateStrategy = SortStateStrategy;
    window.DefaultSortStrategy = DefaultSortStrategy;
    window.AscendingSortStrategy = AscendingSortStrategy;
    window.DescendingSortStrategy = DescendingSortStrategy;
}
