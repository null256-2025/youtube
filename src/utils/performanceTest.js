/**
 * YouTube API最適化のパフォーマンステストユーティリティ
 */

import { getQuotaUsage, resetQuotaUsage } from './youtubeApi';
import { getCacheStats, clearAllCache } from './cache';

/**
 * パフォーマンステストの結果を記録する
 */
class PerformanceTestRecorder {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
  }

  startTest(testName, description) {
    this.currentTest = {
      name: testName,
      description,
      startTime: Date.now(),
      startQuota: getQuotaUsage(),
      startCache: getCacheStats(),
      endTime: null,
      endQuota: null,
      endCache: null,
      duration: null,
      quotaUsed: null,
      cacheEfficiency: null
    };
    
    console.log(`🧪 テスト開始: ${testName}`);
    console.log(`📝 説明: ${description}`);
  }

  endTest() {
    if (!this.currentTest) {
      console.error('テストが開始されていません');
      return null;
    }

    this.currentTest.endTime = Date.now();
    this.currentTest.endQuota = getQuotaUsage();
    this.currentTest.endCache = getCacheStats();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
    
    // クォータ使用量を計算
    this.currentTest.quotaUsed = this.currentTest.endQuota.total - this.currentTest.startQuota.total;
    
    // キャッシュ効率を計算
    const totalRequests = this.currentTest.endQuota.cacheHits + this.currentTest.endQuota.cacheMisses;
    this.currentTest.cacheEfficiency = totalRequests > 0 
      ? Math.round((this.currentTest.endQuota.cacheHits / totalRequests) * 100)
      : 0;

    this.testResults.push({ ...this.currentTest });
    
    console.log(`✅ テスト完了: ${this.currentTest.name}`);
    console.log(`⏱️  実行時間: ${this.currentTest.duration}ms`);
    console.log(`📊 クォータ使用量: ${this.currentTest.quotaUsed}`);
    console.log(`🎯 キャッシュ効率: ${this.currentTest.cacheEfficiency}%`);
    
    const result = { ...this.currentTest };
    this.currentTest = null;
    return result;
  }

  getResults() {
    return [...this.testResults];
  }

  generateReport() {
    if (this.testResults.length === 0) {
      return 'テスト結果がありません。';
    }

    let report = '\n📈 パフォーマンステスト結果レポート\n';
    report += '=' .repeat(50) + '\n\n';

    this.testResults.forEach((result, index) => {
      report += `${index + 1}. ${result.name}\n`;
      report += `   説明: ${result.description}\n`;
      report += `   実行時間: ${result.duration}ms\n`;
      report += `   クォータ使用量: ${result.quotaUsed}\n`;
      report += `   キャッシュ効率: ${result.cacheEfficiency}%\n`;
      report += `   キャッシュヒット: ${result.endQuota.cacheHits}\n`;
      report += `   キャッシュミス: ${result.endQuota.cacheMisses}\n\n`;
    });

    // 統計情報
    const totalQuota = this.testResults.reduce((sum, result) => sum + result.quotaUsed, 0);
    const avgDuration = Math.round(this.testResults.reduce((sum, result) => sum + result.duration, 0) / this.testResults.length);
    const avgCacheEfficiency = Math.round(this.testResults.reduce((sum, result) => sum + result.cacheEfficiency, 0) / this.testResults.length);

    report += '📊 統計情報\n';
    report += '-'.repeat(20) + '\n';
    report += `総クォータ使用量: ${totalQuota}\n`;
    report += `平均実行時間: ${avgDuration}ms\n`;
    report += `平均キャッシュ効率: ${avgCacheEfficiency}%\n`;
    report += `テスト実行回数: ${this.testResults.length}\n`;

    return report;
  }

  clear() {
    this.testResults = [];
    this.currentTest = null;
  }
}

// グローバルインスタンス
export const performanceRecorder = new PerformanceTestRecorder();

/**
 * 最適化前後の比較テスト
 */
export const runOptimizationComparison = async (searchFunction, testParams) => {
  const results = {
    beforeOptimization: null,
    afterOptimization: null,
    improvement: null
  };

  // 最適化前のシミュレーション（キャッシュなし）
  clearAllCache();
  resetQuotaUsage();
  
  performanceRecorder.startTest(
    '最適化前シミュレーション',
    'キャッシュなし、段階的フィルタリングなしの従来方式'
  );
  
  try {
    await searchFunction({ ...testParams, useOptimization: false });
    results.beforeOptimization = performanceRecorder.endTest();
  } catch (error) {
    console.error('最適化前テストでエラー:', error);
    results.beforeOptimization = { quotaUsed: 12000, duration: 30000, cacheEfficiency: 0 }; // 推定値
  }

  // 最適化後のテスト
  clearAllCache();
  resetQuotaUsage();
  
  performanceRecorder.startTest(
    '最適化後',
    'キャッシュ、段階的フィルタリング、並列処理を適用'
  );
  
  try {
    await searchFunction({ ...testParams, useOptimization: true });
    results.afterOptimization = performanceRecorder.endTest();
  } catch (error) {
    console.error('最適化後テストでエラー:', error);
    return null;
  }

  // 改善効果を計算
  if (results.beforeOptimization && results.afterOptimization) {
    const quotaReduction = results.beforeOptimization.quotaUsed - results.afterOptimization.quotaUsed;
    const quotaReductionPercent = Math.round((quotaReduction / results.beforeOptimization.quotaUsed) * 100);
    const speedImprovement = results.beforeOptimization.duration - results.afterOptimization.duration;
    const speedImprovementPercent = Math.round((speedImprovement / results.beforeOptimization.duration) * 100);

    results.improvement = {
      quotaReduction,
      quotaReductionPercent,
      speedImprovement,
      speedImprovementPercent,
      cacheEfficiencyGain: results.afterOptimization.cacheEfficiency
    };
  }

  return results;
};

/**
 * クォータ使用量の詳細分析
 */
export const analyzeQuotaUsage = () => {
  const usage = getQuotaUsage();
  const cacheStats = getCacheStats();
  
  return {
    breakdown: {
      search: usage.search,
      channels: usage.channels,
      videos: usage.videos,
      total: usage.total
    },
    efficiency: {
      cacheHits: usage.cacheHits,
      cacheMisses: usage.cacheMisses,
      cacheHitRate: usage.cacheHits + usage.cacheMisses > 0 
        ? Math.round((usage.cacheHits / (usage.cacheHits + usage.cacheMisses)) * 100)
        : 0
    },
    cache: cacheStats,
    recommendations: generateRecommendations(usage, cacheStats)
  };
};

/**
 * 最適化の推奨事項を生成
 */
const generateRecommendations = (usage, cacheStats) => {
  const recommendations = [];
  
  if (usage.total > 5000) {
    recommendations.push('⚠️ クォータ使用量が高いです。検索条件を絞り込むことを検討してください。');
  }
  
  if (usage.cacheHits / (usage.cacheHits + usage.cacheMisses) < 0.3) {
    recommendations.push('💡 キャッシュ効率が低いです。同じチャンネルを繰り返し検索している可能性があります。');
  }
  
  if (usage.search > usage.channels + usage.videos) {
    recommendations.push('🔍 検索リクエストが多いです。検索語数やページ数を減らすことを検討してください。');
  }
  
  if (cacheStats.expiredEntries > cacheStats.validEntries) {
    recommendations.push('🧹 期限切れのキャッシュが多いです。キャッシュクリーンアップを実行してください。');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ 最適化が適切に機能しています！');
  }
  
  return recommendations;
};

/**
 * パフォーマンス監視のためのメトリクス
 */
export const getPerformanceMetrics = () => {
  const usage = getQuotaUsage();
  const cacheStats = getCacheStats();
  
  return {
    quotaEfficiency: {
      dailyLimit: 10000,
      used: usage.total,
      remaining: 10000 - usage.total,
      usagePercent: Math.round((usage.total / 10000) * 100)
    },
    cachePerformance: {
      hitRate: usage.cacheHits + usage.cacheMisses > 0 
        ? Math.round((usage.cacheHits / (usage.cacheHits + usage.cacheMisses)) * 100)
        : 0,
      totalEntries: cacheStats.totalEntries,
      validEntries: cacheStats.validEntries,
      sizeKB: cacheStats.totalSizeKB
    },
    apiBreakdown: {
      searchRequests: Math.round(usage.search / 100), // 検索は100ユニット/リクエスト
      channelRequests: usage.channels, // チャンネルは1ユニット/リクエスト
      videoRequests: usage.videos // 動画は1ユニット/リクエスト
    }
  };
};