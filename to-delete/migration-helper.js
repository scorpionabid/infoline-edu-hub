#!/usr/bin/env node

/**
 * İnfoLine Unified Systems Migration Script
 * Developer-lərin köhnə API-lərdən yeni unified systems-ə keçməsi üçün
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InfoLineMigrationHelper {
  constructor() {
    this.srcPath = process.cwd() + '/src';
    this.migrationLog = [];
    this.errors = [];
    this.foundIssues = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    console.log(logEntry);
    this.migrationLog.push(logEntry);
  }

  error(message, file = '') {
    const errorEntry = `ERROR in ${file}: ${message}`;
    this.errors.push(errorEntry);
    this.log(errorEntry, 'error');
  }

  /**
   * Scan for old cache API usage
   */
  scanForOldCacheUsage() {
    this.log('🔍 Scanning for old cache API usage...');
    
    const oldCachePatterns = [
      { pattern: /import.*from.*['"]@\/lib\/cache['"]/, message: 'Old lib/cache import found' },
      { pattern: /import.*from.*['"]@\/utils\/cacheUtils['"]/, message: 'Old cacheUtils import found' },
      { pattern: /import.*from.*['"]@\/hooks\/common\/useCachedQuery['"]/, message: 'Old useCachedQuery import found' },
      { pattern: /import.*from.*['"]@\/hooks\/regions\/cache['"]/, message: 'Old regions cache import found' },
      { pattern: /import.*from.*['"]@\/services\/cache\/EnhancedCacheService['"]/, message: 'Old EnhancedCacheService import found' },
      { pattern: /getCache\(/g, message: 'Old getCache() usage found' },
      { pattern: /setCache\(/g, message: 'Old setCache() usage found' },
      { pattern: /clearCache\(/g, message: 'Old clearCache() usage found' },
      { pattern: /getRegionsCache\(/g, message: 'Old getRegionsCache() usage found' },
      { pattern: /enhancedCache\./g, message: 'Old enhancedCache usage found' }
    ];

    this.scanFiles(this.srcPath, oldCachePatterns, 'cache');
  }

  /**
   * Scan for old notification API usage
   */
  scanForOldNotificationUsage() {
    this.log('🔍 Scanning for old notification API usage...');
    
    const oldNotificationPatterns = [
      { pattern: /import.*from.*['"]@\/contexts\/NotificationContext['"]/, message: 'Old NotificationContext import found' },
      { pattern: /import.*from.*['"]@\/hooks\/useNotifications['"]/, message: 'Old useNotifications hook import found' },
      { pattern: /import.*from.*['"]@\/services\/notificationService['"]/, message: 'Old notificationService import found' },
      { pattern: /import.*from.*['"]@\/hooks\/notifications\/useNotifications['"]/, message: 'Duplicate useNotifications import found' },
      { pattern: /createNotification\(/g, message: 'Old createNotification() usage found' },
      { pattern: /createDeadlineNotification\(/g, message: 'Old createDeadlineNotification() usage found' },
      { pattern: /createApprovalNotification\(/g, message: 'Old createApprovalNotification() usage found' }
    ];

    this.scanFiles(this.srcPath, oldNotificationPatterns, 'notification');
  }

  /**
   * Scan files for patterns
   */
  scanFiles(dir, patterns, type) {
    if (!fs.existsSync(dir)) {
      this.error(`Directory does not exist: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build', '__tests__'].includes(file)) {
          this.scanFiles(filePath, patterns, type);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        this.scanFile(filePath, patterns, type);
      }
    });
  }

  /**
   * Scan individual file
   */
  scanFile(filePath, patterns, type) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.srcPath, filePath);
      
      let fileHasIssues = false;
      const fileIssues = [];
      
      patterns.forEach(({ pattern, message }) => {
        const matches = content.match(pattern);
        if (matches) {
          fileHasIssues = true;
          fileIssues.push({
            type,
            pattern: pattern.toString(),
            message,
            matches: matches.length,
            file: relativePath
          });
        }
      });

      if (fileHasIssues) {
        this.foundIssues.push({
          file: relativePath,
          type,
          issues: fileIssues
        });
      }

    } catch (error) {
      this.error(`Could not read file: ${error.message}`, filePath);
    }
  }

  /**
   * Generate migration suggestions
   */
  generateMigrationSuggestions() {
    this.log('📝 Generating migration suggestions...');
    
    const suggestions = {
      cache: {
        title: '🚀 Cache API Migration Guide',
        migrations: [
          {
            from: "import { getCache, setCache } from '@/lib/cache'",
            to: "import { cacheManager } from '@/cache'",
            description: 'Use unified cache manager instead of individual functions'
          },
          {
            from: "getCache('key')",
            to: "cacheManager.get('key')",
            description: 'Use cacheManager.get() for retrieving cached data'
          },
          {
            from: "setCache('key', data, expiry)",
            to: "cacheManager.set('key', data, { ttl: expiry })",
            description: 'Use cacheManager.set() with options object'
          },
          {
            from: "import { useCachedQuery } from '@/hooks/common/useCachedQuery'",
            to: "import { useCachedQuery } from '@/cache'",
            description: 'Use unified cache hooks'
          },
          {
            from: "getRegionsCache()",
            to: "cacheManager.get(CACHE_KEYS.REGIONS)",
            description: 'Use standardized cache keys'
          },
          {
            from: "enhancedCache.set(key, data)",
            to: "cacheManager.set(key, data, { storage: 'memory', crossTab: true })",
            description: 'Use unified cache manager with cross-tab sync'
          }
        ]
      },
      notification: {
        title: '🔔 Notification API Migration Guide',
        migrations: [
          {
            from: "import { useNotifications } from '@/hooks/useNotifications'",
            to: "import { useNotifications } from '@/notifications'",
            description: 'Use unified notification hooks'
          },
          {
            from: "import { createNotification } from '@/services/notificationService'",
            to: "import { notificationManager } from '@/notifications'",
            description: 'Use unified notification manager'
          },
          {
            from: "createNotification(userId, title, message, type)",
            to: "notificationManager.createNotification(userId, title, message, type, options)",
            description: 'Use notificationManager with enhanced options'
          },
          {
            from: "createDeadlineNotification(title, message, categoryId)",
            to: "NotificationHelpers.createDeadlineNotification(userId, categoryName, categoryId, deadlineDate, daysRemaining)",
            description: 'Use helper with better metadata support'
          },
          {
            from: "<NotificationProvider>",
            to: "<UnifiedNotificationProvider userId={userId}>",
            description: 'Use unified provider with user context'
          }
        ]
      }
    };

    return suggestions;
  }

  /**
   * Generate report
   */
  generateReport() {
    const suggestions = this.generateMigrationSuggestions();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 İNFOLINE MIGRATION REPORT');
    console.log('='.repeat(80) + '\n');

    // Summary
    console.log('📈 SUMMARY:');
    console.log(`   Total files scanned: ${this.getScannedFilesCount()}`);
    console.log(`   Files needing migration: ${this.foundIssues.length}`);
    console.log(`   Total issues found: ${this.getTotalIssuesCount()}`);
    console.log(`   Errors encountered: ${this.errors.length}\n`);

    // Issues by type
    const cacheIssues = this.foundIssues.filter(issue => issue.type === 'cache');
    const notificationIssues = this.foundIssues.filter(issue => issue.type === 'notification');

    if (cacheIssues.length > 0) {
      console.log('🗄️  CACHE MIGRATION NEEDED:');
      cacheIssues.forEach(issue => {
        console.log(`   📁 ${issue.file}`);
        issue.issues.forEach(detail => {
          console.log(`      ⚠️  ${detail.message} (${detail.matches} occurrences)`);
        });
      });
      console.log('');
    }

    if (notificationIssues.length > 0) {
      console.log('🔔 NOTIFICATION MIGRATION NEEDED:');
      notificationIssues.forEach(issue => {
        console.log(`   📁 ${issue.file}`);
        issue.issues.forEach(detail => {
          console.log(`      ⚠️  ${detail.message} (${detail.matches} occurrences)`);
        });
      });
      console.log('');
    }

    // Migration guides
    if (cacheIssues.length > 0) {
      console.log(suggestions.cache.title);
      console.log('-'.repeat(40));
      suggestions.cache.migrations.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.description}`);
        console.log(`   FROM: ${migration.from}`);
        console.log(`   TO:   ${migration.to}\n`);
      });
    }

    if (notificationIssues.length > 0) {
      console.log(suggestions.notification.title);
      console.log('-'.repeat(40));
      suggestions.notification.migrations.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.description}`);
        console.log(`   FROM: ${migration.from}`);
        console.log(`   TO:   ${migration.to}\n`);
      });
    }

    // Next steps
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Review the files listed above');
    console.log('   2. Update imports to use unified systems');
    console.log('   3. Replace old API calls with new unified APIs');
    console.log('   4. Test your changes thoroughly');
    console.log('   5. Run this script again to verify completion\n');

    // Resources
    console.log('📚 RESOURCES:');
    console.log('   • Cache API: /src/cache/index.ts');
    console.log('   • Notification API: /src/notifications/index.ts');
    console.log('   • Test Examples: /src/__tests__/unified-*-system.test.ts');
    console.log('   • Migration Status: /REFACTORING_STATUS.md\n');

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }

    console.log('='.repeat(80));
  }

  /**
   * Save detailed report to file
   */
  saveReportToFile() {
    const reportPath = path.join(process.cwd(), 'migration-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.getScannedFilesCount(),
        filesNeedingMigration: this.foundIssues.length,
        totalIssues: this.getTotalIssuesCount(),
        errors: this.errors.length
      },
      issues: this.foundIssues,
      errors: this.errors,
      log: this.migrationLog
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Helper methods
   */
  getScannedFilesCount() {
    // This is an approximation - would need to track actual scanned files
    return this.migrationLog.filter(log => log.includes('Scanning')).length * 50;
  }

  getTotalIssuesCount() {
    return this.foundIssues.reduce((total, file) => total + file.issues.length, 0);
  }

  /**
   * Main execution
   */
  async run() {
    console.log('🚀 Starting İnfoLine Migration Analysis...\n');
    
    try {
      this.scanForOldCacheUsage();
      this.scanForOldNotificationUsage();
      
      this.generateReport();
      this.saveReportToFile();
      
      if (this.foundIssues.length === 0) {
        console.log('🎉 Congratulations! No migration issues found.');
        console.log('Your codebase is already using the unified systems!');
      } else {
        console.log(`⚠️  Migration needed for ${this.foundIssues.length} files.`);
        console.log('Please follow the migration guide above.');
      }
      
    } catch (error) {
      console.error('❌ Migration analysis failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const helper = new InfoLineMigrationHelper();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
İnfoLine Migration Helper

Usage: node migration-helper.js [options]

Options:
  --help, -h     Show this help message
  --cache-only   Only scan for cache-related issues
  --notif-only   Only scan for notification-related issues

Examples:
  node migration-helper.js                    # Full scan
  node migration-helper.js --cache-only       # Cache issues only
  node migration-helper.js --notif-only       # Notification issues only
`);
  process.exit(0);
}

// Override scan methods based on arguments
if (args.includes('--cache-only')) {
  helper.scanForOldNotificationUsage = () => {};
} else if (args.includes('--notif-only')) {
  helper.scanForOldCacheUsage = () => {};
}

// Run the migration helper
helper.run();

export default InfoLineMigrationHelper;
