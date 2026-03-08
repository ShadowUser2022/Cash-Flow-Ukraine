import React, { useState } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { accessibilityTester } from '../../utils/accessibilityTester';

interface TestResults {
  performance: any;
  accessibility: any;
  cardSystemAudit: any;
  timestamp: string;
}

/**
 * Comprehensive Testing Dashboard
 * Integrates performance monitoring, accessibility testing, and card system validation
 */
const TestingDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoFixCount, setAutoFixCount] = useState(0);

  /**
   * Run comprehensive test suite
   */
  const runComprehensiveTests = async () => {
    setIsRunning(true);
    
    try {
      console.log('🧪 Starting comprehensive test suite...');
      
      // Performance monitoring
      console.log('📊 Running performance tests...');
      performanceMonitor.measureVisualStability();
      performanceMonitor.auditCardSystem();
      const performanceReport = performanceMonitor.generateReport();
      
      // Accessibility testing
      console.log('♿ Running accessibility audit...');
      const accessibilityReport = await accessibilityTester.runFullAudit();
      
      // Card system specific audit
      console.log('🃏 Auditing card system...');
      const cardAudit = auditCardSystemImplementation();
      
      const results: TestResults = {
        performance: performanceReport,
        accessibility: accessibilityReport,
        cardSystemAudit: cardAudit,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(results);
      console.log('✅ Test suite completed!', results);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Auto-fix accessibility issues
   */
  const runAutoFix = () => {
    const fixedCount = accessibilityTester.autoFixBasicIssues();
    setAutoFixCount(fixedCount);
    console.log(`🔧 Auto-fixed ${fixedCount} accessibility issues`);
  };

  /**
   * Audit card system implementation
   */
  const auditCardSystemImplementation = () => {
    const cardElements = document.querySelectorAll('[class*="card"]');
    const cardTypes = [
      'card', 'player-card', 'lobby-card', 'deal-card', 
      'board-card', 'chat-card', 'action-card', 'stats-card', 'modal-card'
    ];
    const stateModifiers = [
      'active', 'disabled', 'loading', 'glow', 'pulse', 
      'card-clickable', 'hover-lift', 'minimized'
    ];

    let implementationScore = 100;
    let consistencyIssues = [];
    let performanceIssues = [];

    // Check card type usage
    cardElements.forEach((element, index) => {
      const classes = Array.from(element.classList);
      const hasCardType = cardTypes.some(type => classes.includes(type));
      
      if (!hasCardType) {
        consistencyIssues.push(`Element ${index}: Missing card type class`);
        implementationScore -= 5;
      }

      // Check for performance issues
      const style = window.getComputedStyle(element);
      if (style.transform !== 'none' && style.willChange !== 'transform') {
        performanceIssues.push(`Element ${index}: Expensive transform without will-change`);
        implementationScore -= 2;
      }
    });

    // Check CSS variables usage
    const rootStyles = getComputedStyle(document.documentElement);
    const hasCardVariables = rootStyles.getPropertyValue('--card-bg') !== '';
    
    if (!hasCardVariables) {
      consistencyIssues.push('CSS variables not properly defined');
      implementationScore -= 10;
    }

    return {
      score: Math.max(0, implementationScore),
      totalCards: cardElements.length,
      cardTypes: cardTypes.length,
      stateModifiers: stateModifiers.length,
      consistencyIssues,
      performanceIssues,
      recommendations: generateCardSystemRecommendations(consistencyIssues, performanceIssues)
    };
  };

  /**
   * Generate recommendations for card system
   */
  const generateCardSystemRecommendations = (consistencyIssues: string[], performanceIssues: string[]) => {
    const recommendations = [];

    if (consistencyIssues.length > 0) {
      recommendations.push('🎯 Improve consistency by ensuring all card elements use proper card type classes');
    }

    if (performanceIssues.length > 0) {
      recommendations.push('⚡ Optimize performance by adding will-change property to animated elements');
    }

    recommendations.push('📱 Test card responsiveness on different screen sizes');
    recommendations.push('🌙 Verify card system works with dark/light theme toggles');
    recommendations.push('🔄 Test card state transitions for smooth animations');

    return recommendations;
  };

  /**
   * Performance test for specific interactions
   */
  const testInteractionPerformance = (interactionName: string) => {
    performanceMonitor.measureInteraction(interactionName, () => {
      // Simulate interaction
      console.log(`Testing ${interactionName} performance`);
    });
  };

  /**
   * Export test results
   */
  const exportResults = () => {
    if (!testResults) return;

    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-card" style={{ maxWidth: '1200px', margin: '20px' }}>
      <div className="card-header">
        <h2>🧪 Comprehensive Testing Dashboard</h2>
        <p>Performance monitoring, accessibility testing, and card system validation</p>
      </div>

      <div className="card-content">
        {/* Control Panel */}
        <div className="stats-card" style={{ marginBottom: '20px' }}>
          <h3>Test Controls</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button 
              className="action-card card-clickable"
              onClick={runComprehensiveTests}
              disabled={isRunning}
              style={{ minWidth: '150px' }}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </button>
            
            <button 
              className="action-card card-clickable"
              onClick={runAutoFix}
              style={{ minWidth: '120px' }}
            >
              🔧 Auto-Fix Issues
            </button>
            
            <button 
              className="action-card card-clickable"
              onClick={() => testInteractionPerformance('button-click')}
              style={{ minWidth: '120px' }}
            >
              ⚡ Test Interaction
            </button>
            
            {testResults && (
              <button 
                className="action-card card-clickable"
                onClick={exportResults}
                style={{ minWidth: '120px' }}
              >
                📥 Export Results
              </button>
            )}
          </div>
          
          {autoFixCount > 0 && (
            <div className="stats-card glow" style={{ marginTop: '10px', padding: '10px' }}>
              ✅ Auto-fixed {autoFixCount} accessibility issues
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            
            {/* Performance Results */}
            <div className="stats-card">
              <h3>📊 Performance Report</h3>
              <div style={{ marginTop: '10px' }}>
                <div className="card-metric">
                  <strong>Overall Score:</strong> 
                  <span className={testResults.performance.summary?.overallPerformanceScore > 80 ? 'text-success' : 'text-warning'}>
                    {testResults.performance.summary?.overallPerformanceScore?.toFixed(1) || 'N/A'}/100
                  </span>
                </div>
                <div className="card-metric">
                  <strong>Avg Render Time:</strong> {testResults.performance.summary?.averageRenderTime?.toFixed(2) || 'N/A'}ms
                </div>
                <div className="card-metric">
                  <strong>Memory Efficiency:</strong> {testResults.performance.summary?.memoryEfficiency || 'N/A'}%
                </div>
                
                {testResults.performance.recommendations?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Recommendations:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {testResults.performance.recommendations.map((rec: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.9em', color: '#666' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Accessibility Results */}
            <div className="stats-card">
              <h3>♿ Accessibility Report</h3>
              <div style={{ marginTop: '10px' }}>
                <div className="card-metric">
                  <strong>Accessibility Score:</strong> 
                  <span className={testResults.accessibility.score > 90 ? 'text-success' : testResults.accessibility.score > 70 ? 'text-warning' : 'text-error'}>
                    {testResults.accessibility.score}/100
                  </span>
                </div>
                <div className="card-metric">
                  <strong>Errors:</strong> <span className="text-error">{testResults.accessibility.summary.errors}</span>
                </div>
                <div className="card-metric">
                  <strong>Warnings:</strong> <span className="text-warning">{testResults.accessibility.summary.warnings}</span>
                </div>
                <div className="card-metric">
                  <strong>Passed Checks:</strong> <span className="text-success">{testResults.accessibility.passedChecks.length}</span>
                </div>
                
                {testResults.accessibility.issues.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Top Issues:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {testResults.accessibility.issues.slice(0, 3).map((issue: any, i: number) => (
                        <li key={i} style={{ fontSize: '0.9em', color: issue.severity === 'error' ? '#d32f2f' : '#f57c00' }}>
                          {issue.type}: {issue.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Card System Audit */}
            <div className="stats-card">
              <h3>🃏 Card System Audit</h3>
              <div style={{ marginTop: '10px' }}>
                <div className="card-metric">
                  <strong>Implementation Score:</strong> 
                  <span className={testResults.cardSystemAudit.score > 90 ? 'text-success' : 'text-warning'}>
                    {testResults.cardSystemAudit.score}/100
                  </span>
                </div>
                <div className="card-metric">
                  <strong>Total Cards:</strong> {testResults.cardSystemAudit.totalCards}
                </div>
                <div className="card-metric">
                  <strong>Card Types:</strong> {testResults.cardSystemAudit.cardTypes}
                </div>
                <div className="card-metric">
                  <strong>State Modifiers:</strong> {testResults.cardSystemAudit.stateModifiers}
                </div>
                
                {testResults.cardSystemAudit.recommendations?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Recommendations:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {testResults.cardSystemAudit.recommendations.map((rec: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.9em', color: '#666' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="lobby-card" style={{ marginTop: '20px' }}>
          <h3>🚀 Quick Performance Tests</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button 
              className="action-card card-clickable"
              onClick={() => performanceMonitor.auditCardSystem()}
              style={{ fontSize: '0.9em' }}
            >
              Test Card Performance
            </button>
            <button 
              className="action-card card-clickable"
              onClick={() => testInteractionPerformance('card-hover')}
              style={{ fontSize: '0.9em' }}
            >
              Test Hover Performance
            </button>
            <button 
              className="action-card card-clickable"
              onClick={() => testInteractionPerformance('animation')}
              style={{ fontSize: '0.9em' }}
            >
              Test Animation Performance
            </button>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="card" style={{ marginTop: '20px', padding: '15px', background: 'rgba(var(--accent-color), 0.1)' }}>
          <h4>📚 Documentation & Guidelines</h4>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            For detailed implementation guidelines, see:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '5px', fontSize: '0.9em' }}>
            <li>CARD_SYSTEM_IMPLEMENTATION.md - Universal card system documentation</li>
            <li>LOBBY_UX_OPTIMIZATION.md - UX optimization guidelines</li>
            <li>Performance best practices for React components</li>
            <li>WCAG 2.1 accessibility standards compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestingDashboard;
