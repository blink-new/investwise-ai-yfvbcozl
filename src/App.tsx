import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Famous quotes for loading screens
const FAMOUS_QUOTES = [
  {
    quote: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett"
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett"
  },
  {
    quote: "It's not how much money you make, but how much money you keep.",
    author: "Robert Kiyosaki"
  },
  {
    quote: "The investor's chief problem - and even his worst enemy - is likely to be himself.",
    author: "Benjamin Graham"
  },
  {
    quote: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett"
  }
];

interface UserProfile {
  name: string;
  age: string;
  occupation: string;
  income: string;
  current_savings: string;
  investment_experience: string;
  risk_tolerance: string;
  financial_goals: string[];
  investment_timeline: string;
}

interface RiskAssessment {
  risk_score: number;
  behavioral_profile: string;
  investment_personality: string;
  market_sentiment: string;
  confidence_level: string;
  behavioral_biases: string[];
}

interface MutualFund {
  name: string;
  category: string;
  rating: string;
  allocation_percentage: string;
  returns_3y: string;
  returns_5y: string;
  returns_10y: string;
  aum: string;
  stocks_count: string;
  monthly_sip: string;
  fund_manager: string;
}

interface Recommendations {
  portfolio_allocation: Record<string, number>;
  mutual_funds: MutualFund[];
  rationale: string;
  risk_mitigation: string;
  expected_returns: string;
  tax_implications: string;
  investment_strategy: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    occupation: '',
    income: '',
    current_savings: '',
    investment_experience: 'beginner',
    risk_tolerance: 'low',
    financial_goals: [],
    investment_timeline: '1-3 years'
  });
  const [userId, setUserId] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [currentQuote, setCurrentQuote] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const goalOptions = [
    { id: 'retirement', label: 'Retirement Planning', icon: '🏖️' },
    { id: 'education', label: 'Child Education', icon: '🎓' },
    { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
    { id: 'wealth', label: 'Wealth Creation', icon: '💰' },
    { id: 'tax', label: 'Tax Saving', icon: '📊' },
    { id: 'home', label: 'Home Purchase', icon: '🏠' },
    { id: 'travel', label: 'Travel Fund', icon: '✈️' },
    { id: 'business', label: 'Business Investment', icon: '🚀' }
  ];

  // Smooth scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quote rotation for loading screens
  useEffect(() => {
    if (loading) {
      const quoteInterval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % FAMOUS_QUOTES.length);
      }, 4000);
      return () => clearInterval(quoteInterval);
    }
  }, [loading]);

  // Loading progress simulation
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    }
  }, [loading]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [currentStep]);

  // Fixed input handling to prevent cursor disappearing
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goalId: string) => {
    setUserProfile(prev => ({
      ...prev,
      financial_goals: prev.financial_goals.includes(goalId)
        ? prev.financial_goals.filter(g => g !== goalId)
        : [...prev.financial_goals, goalId]
    }));
  };

  const createUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userProfile,
          age: parseInt(userProfile.age) || 0,
          income: parseFloat(userProfile.income) || 0,
          current_savings: parseFloat(userProfile.current_savings) || 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const data = await response.json();
      setUserId(data.user_id);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep('assessment');
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const performRiskAssessment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/risk-assessment?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to perform assessment');
      }

      const data = await response.json();
      setRiskAssessment(data);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep('recommendations');
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/investment-recommendations?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep('dashboard');
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const LoadingScreen = ({ message }: { message: string }) => (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-brain">🧠</div>
          <div className="loading-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
        
        <div className="loading-content">
          <h2>{message}</h2>
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <span className="progress-text">{Math.round(loadingProgress)}%</span>
          </div>
          
          <div className="quote-container">
            <div className="quote-text">
              "{FAMOUS_QUOTES[currentQuote].quote}"
            </div>
            <div className="quote-author">
              - {FAMOUS_QUOTES[currentQuote].author}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="welcome-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="floating-shapes">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`shape shape-${i + 1}`}></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
            <h1 className="hero-title">
              Transform your
              <span className="highlight"> investment fears</span>
              <br />into
              <span className="highlight-2"> financial freedom</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered behavioral finance insights designed for the Indian market. 
              Overcome psychological barriers and build wealth with confidence.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">98%</div>
                <div className="stat-label">Bias Detection</div>
              </div>
              <div className="stat">
                <div className="stat-number">15.2%</div>
                <div className="stat-label">Avg. Returns</div>
              </div>
              <div className="stat">
                <div className="stat-number">25k+</div>
                <div className="stat-label">Happy Investors</div>
              </div>
            </div>
            <button 
              className="cta-button"
              onClick={() => setCurrentStep('profile')}
            >
              <span>Start Your Journey</span>
              <div className="button-glow"></div>
            </button>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="preview-title">Portfolio Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '45%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                    <div className="bar" style={{ height: '70%' }}></div>
                  </div>
                </div>
                <div className="preview-metrics">
                  <div className="metric">
                    <span className="metric-label">Total Value</span>
                    <span className="metric-value">₹12,45,000</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Returns</span>
                    <span className="metric-value">+18.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title animate-on-scroll" id="features-title">
            Why Choose InvestWise AI?
          </h2>
          <div className="features-grid">
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">🧠</div>
              <h3>Behavioral Analysis</h3>
              <p>Advanced AI identifies and helps overcome psychological barriers like the "snake-bite effect" that prevent successful investing.</p>
              <div className="feature-glow"></div>
            </div>
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">📊</div>
              <h3>Indian Market Expertise</h3>
              <p>Deep understanding of Indian mutual funds, tax laws, and market cycles with comprehensive fund analysis including ratings and returns.</p>
              <div className="feature-glow"></div>
            </div>
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">🎯</div>
              <h3>Personalized Strategy</h3>
              <p>AI-powered portfolio allocation tailored to your risk profile, financial goals, and investment timeline with detailed fund recommendations.</p>
              <div className="feature-glow"></div>
            </div>
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">💰</div>
              <h3>Tax Optimization</h3>
              <p>Smart tax planning strategies designed for Indian investors including ELSS recommendations and tax-efficient withdrawal plans.</p>
              <div className="feature-glow"></div>
            </div>
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">🚀</div>
              <h3>SIP Planning</h3>
              <p>Systematic investment plans with automatic step-up suggestions and fund-wise allocation for optimal wealth creation.</p>
              <div className="feature-glow"></div>
            </div>
            <div className={`feature-card glass-card ${isVisible['features-title'] ? 'visible' : ''}`}>
              <div className="feature-icon">📈</div>
              <h3>Real-time Insights</h3>
              <p>Comprehensive fund analysis with 3/5/10-year returns, ratings, AUM, and portfolio composition for informed decision making.</p>
              <div className="feature-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solution Section */}
      <section className="problem-solution-section">
        <div className="container">
          <div className="problem-solution-content">
            <div className="problem-side">
              <h3>The Problem</h3>
              <div className="problem-list">
                <div className="problem-item">
                  <span className="problem-icon">❌</span>
                  <span>Fear of investing after market losses</span>
                </div>
                <div className="problem-item">
                  <span className="problem-icon">❌</span>
                  <span>Lack of understanding of mutual funds</span>
                </div>
                <div className="problem-item">
                  <span className="problem-icon">❌</span>
                  <span>Emotional decision making</span>
                </div>
                <div className="problem-item">
                  <span className="problem-icon">❌</span>
                  <span>Complex fund selection process</span>
                </div>
              </div>
            </div>
            <div className="solution-side">
              <h3>Our Solution</h3>
              <div className="solution-list">
                <div className="solution-item">
                  <span className="solution-icon">✅</span>
                  <span>Behavioral bias detection & correction</span>
                </div>
                <div className="solution-item">
                  <span className="solution-icon">✅</span>
                  <span>Comprehensive fund analysis & ratings</span>
                </div>
                <div className="solution-item">
                  <span className="solution-icon">✅</span>
                  <span>Psychology-based recommendations</span>
                </div>
                <div className="solution-item">
                  <span className="solution-icon">✅</span>
                  <span>Simplified investment process</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Investment Journey?</h2>
            <p>Join thousands of investors who have overcome their fears and built wealth with InvestWise AI</p>
            <button 
              className="cta-button large"
              onClick={() => setCurrentStep('profile')}
            >
              <span>Get Started Now</span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const ProfileScreen = () => (
    <div className="profile-screen">
      <div className="profile-container glass-card">
        <div className="profile-header">
          <h2>Tell us about yourself</h2>
          <p>We'll use this information to create your personalized investment psychology profile</p>
        </div>
        
        <div className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter your age"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Occupation *</label>
              <input
                type="text"
                value={userProfile.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="e.g., Software Engineer, Doctor, Teacher"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Financial Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Annual Income (₹) *</label>
                <input
                  type="number"
                  value={userProfile.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  placeholder="Enter your annual income"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Savings (₹) *</label>
                <input
                  type="number"
                  value={userProfile.current_savings}
                  onChange={(e) => handleInputChange('current_savings', e.target.value)}
                  placeholder="Enter your current savings"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Investment Profile</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Investment Experience *</label>
                <select
                  value={userProfile.investment_experience}
                  onChange={(e) => handleInputChange('investment_experience', e.target.value)}
                  className="form-select"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Risk Tolerance *</label>
                <select
                  value={userProfile.risk_tolerance}
                  onChange={(e) => handleInputChange('risk_tolerance', e.target.value)}
                  className="form-select"
                >
                  <option value="low">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Investment Timeline *</label>
              <select
                value={userProfile.investment_timeline}
                onChange={(e) => handleInputChange('investment_timeline', e.target.value)}
                className="form-select"
              >
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Financial Goals</h3>
            <div className="goals-grid">
              {goalOptions.map(goal => (
                <div
                  key={goal.id}
                  className={`goal-card glass-card ${userProfile.financial_goals.includes(goal.id) ? 'selected' : ''}`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <div className="goal-icon">{goal.icon}</div>
                  <div className="goal-label">{goal.label}</div>
                  <div className="goal-glow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            className="submit-button"
            onClick={createUserProfile}
            disabled={loading || !userProfile.name || !userProfile.age || !userProfile.occupation || !userProfile.income}
          >
            {loading ? (
              <LoadingScreen message="Creating your investment profile..." />
            ) : (
              <>
                <span>Continue to Assessment</span>
                <div className="button-glow"></div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const AssessmentScreen = () => (
    <div className="assessment-screen">
      <div className="assessment-container glass-card">
        <div className="assessment-header">
          <h2>Behavioral Assessment</h2>
          <p>Let's analyze your investment psychology to create a personalized strategy</p>
        </div>
        
        <div className="assessment-content">
          <div className="assessment-visual">
            <div className="brain-container">
              <div className="brain-icon">🧠</div>
              <div className="brain-waves">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`wave wave-${i + 1}`}></div>
                ))}
              </div>
            </div>
            <div className="analysis-items">
              <div className="analysis-item">
                <div className="item-icon">🎯</div>
                <div className="item-text">Risk tolerance evaluation</div>
              </div>
              <div className="analysis-item">
                <div className="item-icon">📊</div>
                <div className="item-text">Behavioral bias detection</div>
              </div>
              <div className="analysis-item">
                <div className="item-icon">💡</div>
                <div className="item-text">Investment personality profiling</div>
              </div>
              <div className="analysis-item">
                <div className="item-icon">🇮🇳</div>
                <div className="item-text">Indian market context analysis</div>
              </div>
            </div>
          </div>
          
          <div className="assessment-info">
            <h3>What we'll discover:</h3>
            <ul>
              <li>Your true risk capacity vs. risk tolerance</li>
              <li>Potential behavioral biases affecting your decisions</li>
              <li>Optimal investment approach for your personality</li>
              <li>Strategies to overcome investment fears</li>
              <li>Best suited mutual fund categories for you</li>
              <li>Tax-efficient investment planning</li>
            </ul>
          </div>
        </div>
        
        <button 
          className="assessment-button"
          onClick={performRiskAssessment}
          disabled={loading}
        >
          {loading ? (
            <LoadingScreen message="Analyzing your investment psychology..." />
          ) : (
            <>
              <span>Start Assessment</span>
              <div className="button-glow"></div>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const RecommendationsScreen = () => (
    <div className="recommendations-screen">
      <div className="recommendations-container glass-card">
        <div className="recommendations-header">
          <h2>Your Investment Profile</h2>
          <p>Based on your behavioral analysis, here's what we discovered</p>
        </div>
        
        {riskAssessment && (
          <div className="profile-results">
            <div className="result-card glass-card risk-score">
              <div className="card-header">
                <h3>Risk Score</h3>
                <div className="score-value">{riskAssessment.risk_score}/10</div>
              </div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${(riskAssessment.risk_score / 10) * 100}%` }}
                ></div>
              </div>
              <div className="score-label">{riskAssessment.behavioral_profile}</div>
            </div>
            
            <div className="result-card glass-card investor-type">
              <div className="card-header">
                <h3>Investment Personality</h3>
                <div className="type-badge">{riskAssessment.investment_personality}</div>
              </div>
              <div className="personality-details">
                <div className="detail-item">
                  <span className="detail-label">Market Sentiment:</span>
                  <span className="detail-value">{riskAssessment.market_sentiment}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Confidence Level:</span>
                  <span className="detail-value">{riskAssessment.confidence_level}</span>
                </div>
              </div>
            </div>
            
            {riskAssessment.behavioral_biases && riskAssessment.behavioral_biases.length > 0 && (
              <div className="result-card glass-card biases">
                <div className="card-header">
                  <h3>Behavioral Considerations</h3>
                </div>
                <div className="biases-list">
                  {riskAssessment.behavioral_biases.map((bias, index) => (
                    <div key={index} className="bias-item">
                      <span className="bias-icon">⚠️</span>
                      <span className="bias-text">{bias.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <button 
          className="recommendations-button"
          onClick={getRecommendations}
          disabled={loading}
        >
          {loading ? (
            <LoadingScreen message="Generating your personalized investment recommendations..." />
          ) : (
            <>
              <span>Get My Investment Plan</span>
              <div className="button-glow"></div>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const DashboardScreen = () => (
    <div className="dashboard-screen">
      <div className="dashboard-container glass-card">
        <div className="dashboard-header">
          <h2>Your Personalized Investment Plan</h2>
          <p>Comprehensive recommendations based on your behavioral profile</p>
        </div>
        
        {recommendations && (
          <div className="dashboard-content">
            <div className="portfolio-section">
              <h3>Recommended Portfolio Allocation</h3>
              <div className="allocation-grid">
                {Object.entries(recommendations.portfolio_allocation).map(([category, percentage]) => (
                  <div key={category} className="allocation-card glass-card">
                    <div className="allocation-header">
                      <span className="category-name">{category.replace(/_/g, ' ')}</span>
                      <span className="percentage">{percentage}%</span>
                    </div>
                    <div className="allocation-bar">
                      <div 
                        className="allocation-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="allocation-glow"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="funds-section">
              <h3>Recommended Mutual Funds</h3>
              <div className="funds-grid">
                {recommendations.mutual_funds.map((fund, index) => (
                  <div key={index} className="fund-card glass-card">
                    <div className="fund-header">
                      <h4>{fund.name}</h4>
                      <div className="fund-rating">
                        <span className="rating">⭐ {fund.rating}</span>
                        <span className="fund-category">{fund.category}</span>
                      </div>
                    </div>
                    <div className="fund-body">
                      <div className="fund-allocation">{fund.allocation_percentage}% Allocation</div>
                      <div className="fund-details">
                        <div className="detail-row">
                          <span className="detail-label">3Y Returns:</span>
                          <span className="detail-value">{fund.returns_3y}%</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">5Y Returns:</span>
                          <span className="detail-value">{fund.returns_5y}%</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">10Y Returns:</span>
                          <span className="detail-value">{fund.returns_10y}%</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">AUM:</span>
                          <span className="detail-value">₹{fund.aum} Cr</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Stocks:</span>
                          <span className="detail-value">{fund.stocks_count}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">SIP:</span>
                          <span className="detail-value">₹{fund.monthly_sip}/month</span>
                        </div>
                      </div>
                      <div className="fund-manager">Fund Manager: {fund.fund_manager}</div>
                    </div>
                    <div className="fund-glow"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="insights-section">
              <div className="insight-card glass-card">
                <h3>Why This Strategy Works for You</h3>
                <div className="insight-content">
                  {recommendations.rationale.split('\n').map((line, index) => (
                    line.trim() && <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>
              
              <div className="insight-card glass-card">
                <h3>Risk Management Strategy</h3>
                <div className="insight-content">
                  {recommendations.risk_mitigation.split('\n').map((line, index) => (
                    line.trim() && <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>
              
              <div className="insight-card glass-card returns">
                <h3>Expected Returns & Growth</h3>
                <div className="returns-content">
                  {recommendations.expected_returns.split('\n').map((line, index) => (
                    line.trim() && <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>

              <div className="insight-card glass-card">
                <h3>Tax Implications</h3>
                <div className="insight-content">
                  {recommendations.tax_implications.split('\n').map((line, index) => (
                    line.trim() && <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>

              <div className="insight-card glass-card">
                <h3>Investment Strategy</h3>
                <div className="insight-content">
                  {recommendations.investment_strategy.split('\n').map((line, index) => (
                    line.trim() && <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="action-section">
              <button className="premium-button">
                <span>Upgrade to Premium AI Advisory</span>
                <span className="premium-badge">₹2,999/month</span>
                <div className="button-glow"></div>
              </button>
              <button className="secondary-button" onClick={() => setCurrentStep('welcome')}>
                <span>Start New Assessment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <LoadingScreen 
        message={
          currentStep === 'profile' ? "Creating your investment profile..." :
          currentStep === 'assessment' ? "Analyzing your investment psychology..." :
          "Generating your personalized investment recommendations..."
        }
      />
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <h1>InvestWise</h1>
          </div>
          <div className="nav-progress">
            <div className="progress-steps">
              <div className={`step ${currentStep === 'welcome' ? 'active' : ''}`}>Welcome</div>
              <div className={`step ${currentStep === 'profile' ? 'active' : ''}`}>Profile</div>
              <div className={`step ${currentStep === 'assessment' ? 'active' : ''}`}>Assessment</div>
              <div className={`step ${currentStep === 'recommendations' ? 'active' : ''}`}>Results</div>
              <div className={`step ${currentStep === 'dashboard' ? 'active' : ''}`}>Dashboard</div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError('')}>×</button>
            </div>
          </div>
        )}
        
        {currentStep === 'welcome' && <WelcomeScreen />}
        {currentStep === 'profile' && <ProfileScreen />}
        {currentStep === 'assessment' && <AssessmentScreen />}
        {currentStep === 'recommendations' && <RecommendationsScreen />}
        {currentStep === 'dashboard' && <DashboardScreen />}
      </main>
    </div>
  );
}

export default App;