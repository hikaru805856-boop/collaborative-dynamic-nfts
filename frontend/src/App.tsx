import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Enhanced Interfaces
interface NFT {
  id: number;
  creator: string;
  title: string;
  description: string;
  contributions: Array<Contribution>;
  aiEvolutionStage: number;
  adaptiveMetadata: {
    currentTheme: string;
    suggestedImprovements: string[];
    evolutionHistory: string[];
  };
  isStaked?: boolean;
  stakingRewards?: number;
  stakingProgress?: number;
  chatMessages?: Array<ChatMessage>;
  isOpen: boolean;
  collaborationScore?: number;
  trendingScore?: number;
  lastActivity?: string;
  category?: string;
}

interface Contribution {
  id?: number;
  contributor: string;
  contributionType: string;
  role: 'Creator' | 'Artist' | 'Developer' | 'Marketer' | 'Curator';
  votesUp: number;
  votesDown: number;
  approved: boolean;
  timestamp: string;
  skillBadges: string[];
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

function App() {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false); // ✅ NEW: Documentation modal
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeChatNFT, setActiveChatNFT] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newNFT, setNewNFT] = useState({
    creator: '',
    title: '',
    description: ''
  });

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemPreference;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleChat = (nftId: number) => {
    setActiveChatNFT(prevId => prevId === nftId ? null : nftId);
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3001/api/nfts');
      const enhancedNFTs = response.data.map((nft: any, idx: number) => ({
        ...nft,
        aiEvolutionStage: nft.aiEvolutionStage || Math.min(5, Math.floor(nft.contributions.length / 2)),
        adaptiveMetadata: nft.adaptiveMetadata || {
          currentTheme: 'Collaborative',
          suggestedImprovements: ['Add vocals', 'Enhance visuals', 'Include marketing'],
          evolutionHistory: [`Created with ${nft.contributions.length} contributions`]
        },
        isStaked: nft.isStaked || Math.random() > 0.5,
        stakingRewards: nft.stakingRewards || Math.floor(Math.random() * 100) + 50,
        stakingProgress: nft.stakingProgress || Math.floor(Math.random() * 100) + 20,
        chatMessages: nft.chatMessages || [],
        collaborationScore: Math.floor(Math.random() * 50) + 50,
        trendingScore: Math.floor(Math.random() * 100) + 30,
        lastActivity: `${Math.floor(Math.random() * 24)}h ago`,
        category: ['Music', 'Art', 'Gaming', 'Tech'][Math.floor(Math.random() * 4)],
        contributions: nft.contributions.map((contrib: any, contribIdx: number) => ({
          ...contrib,
          id: contribIdx,
          role: contrib.role || ['Creator', 'Artist', 'Developer', 'Marketer'][Math.floor(Math.random() * 4)],
          votesUp: contrib.votesUp || Math.floor(Math.random() * 10),
          votesDown: contrib.votesDown || Math.floor(Math.random() * 3),
          approved: contrib.approved !== undefined ? contrib.approved : Math.random() > 0.3,
          skillBadges: contrib.skillBadges || ['🎨 Creative', '💡 Innovative']
        }))
      }));
      setNFTs(enhancedNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // All existing functions...
  const createNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post('http://localhost:3001/api/nfts', newNFT);
      setNewNFT({ creator: '', title: '', description: '' });
      setShowCreateForm(false);
      fetchNFTs();
    } catch (error) {
      console.error('Error creating NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContribution = async (nftId: number, contributor: string, contributionType: string) => {
    try {
      setIsLoading(true);
      await axios.post(`http://localhost:3001/api/nfts/${nftId}/contribute`, {
        contributor,
        contributionType
      });
      fetchNFTs();
    } catch (error) {
      console.error('Error adding contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const evolveNFT = async (nftId: number) => {
    try {
      setNFTs(prevNFTs => 
        prevNFTs.map(n => 
          n.id === nftId 
            ? { ...n, aiEvolutionStage: Math.min(5, n.aiEvolutionStage + 1) }
            : n
        )
      );
    } catch (error) {
      console.error('Error evolving NFT:', error);
    }
  };

  const toggleStaking = (nftId: number) => {
    setNFTs(prevNFTs => 
      prevNFTs.map(nft => 
        nft.id === nftId 
          ? {
              ...nft,
              isStaked: !nft.isStaked,
              stakingProgress: nft.isStaked ? 0 : 25
            }
          : nft
      )
    );
  };

  const handleContributeClick = (nftId: number) => {
    const contributor = prompt('🎨 Enter contributor wallet address:');
    const contributionType = prompt('✨ What type of contribution?');
    
    if (contributor && contributionType) {
      addContribution(nftId, contributor, contributionType);
    }
  };

  // Enhanced Chat System
  const CollaborationChat = ({ nft }: { nft: NFT }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', author: 'AI Assistant', text: `Welcome to ${nft.title} collaboration! 🎨`, timestamp: new Date().toLocaleTimeString() },
      { id: '2', author: 'Community', text: 'This project has amazing potential!', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = () => {
      if (newMessage.trim()) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          author: 'You',
          text: newMessage,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages([...messages, message]);
        setNewMessage('');
      }
    };

    return (
      <div className="chat-panel-overlay">
        <div className="chat-panel">
          <div className="chat-header">
            <h4>💬 {nft.title} Collaboration</h4>
            <button onClick={() => setActiveChatNFT(null)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className="message">
                <div className="message-header">
                  <span className="author">{msg.author}</span>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
                <div className="text">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your creative ideas..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Analytics Dashboard with More Features
  const PlatformAnalytics = () => (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h3>🔥 Live Platform Analytics</h3>
        <div className="pulse-indicator">● LIVE</div>
      </div>
      
      {/* Real-time Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-value">{nfts.length}</div>
          <div className="stat-label">Active NFTs</div>
          <div className="stat-change">+{Math.floor(Math.random() * 5)}% today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{nfts.reduce((acc, nft) => acc + nft.contributions.length + 1, 0)}</div>
          <div className="stat-label">Collaborators</div>
          <div className="stat-change">+{Math.floor(Math.random() * 10)}% week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-value">{nfts.reduce((acc, nft) => acc + nft.aiEvolutionStage, 0)}</div>
          <div className="stat-label">AI Evolutions</div>
          <div className="stat-change">+{Math.floor(Math.random() * 15)}% week</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <h4>📊 Categories</h4>
        <div className="category-tags">
          {['all', 'Music', 'Art', 'Gaming', 'Tech'].map(cat => (
            <button 
              key={cat}
              className={`category-tag ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? '🌟 All' : cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Trending NFT Showcase */}
      {nfts.length > 0 && (
        <div className="trending-section">
          <h4>🌟 Most Collaborative NFT</h4>
          <div className="trending-nft">
            <div className="trending-info">
              <div className="trending-details">
                <span className="trending-title">{nfts[0].title}</span>
                <span className="trending-category">#{nfts[0].category}</span>
              </div>
              <span className="trending-score">Score: {nfts[0].collaborationScore || 95}/100</span>
            </div>
            <div className="trending-bar">
              <div 
                className="trending-progress" 
                style={{width: `${nfts[0].collaborationScore || 95}%`}}
              />
            </div>
            <div className="trending-stats">
              <span className="trending-stat">👥 {nfts[0].contributions.length + 1} collaborators</span>
              <span className="trending-stat">🕒 {nfts[0].lastActivity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="achievement-section">
        <h4>🏆 Today's Achievements</h4>
        <div className="achievement-list">
          <div className="achievement-item">
            <span className="achievement-icon">🎯</span>
            <div className="achievement-text">
              <div className="achievement-title">First Evolution</div>
              <div className="achievement-desc">NFT reached evolution stage 1</div>
            </div>
          </div>
          <div className="achievement-item">
            <span className="achievement-icon">💎</span>
            <div className="achievement-text">
              <div className="achievement-title">Staking Milestone</div>
              <div className="achievement-desc">100+ tokens staked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary action-btn"
        >
          🚀 Launch New Project
        </button>
        <button 
          onClick={() => setShowLearnMore(true)}
          className="btn btn-secondary action-btn"
        >
          📊 View Full Analytics
        </button>
        <button 
          onClick={() => setShowDocumentation(true)} // ✅ FIXED: Documentation modal
          className="btn btn-tertiary action-btn"
        >
          📚 Documentation
        </button>
      </div>
    </div>
  );

  // Enhanced NFT Card Components
  const AIEvolutionDisplay = ({ nft }: { nft: NFT }) => (
    <div className="ai-evolution">
      <div className="evolution-header">
        <span className="evolution-label">🤖 AI Stage: {nft.aiEvolutionStage}/5</span>
        <button 
          className="evolve-btn"
          onClick={() => evolveNFT(nft.id)}
          disabled={nft.aiEvolutionStage >= 5}
        >
          {nft.aiEvolutionStage >= 5 ? '✨ Max' : '🚀 Evolve'}
        </button>
      </div>
      <div className="evolution-progress">
        <div 
          className="evolution-bar"
          style={{width: `${(nft.aiEvolutionStage / 5) * 100}%`}}
        />
      </div>
      <div className="evolution-benefits">
        <span className="benefit-tag">🧠 +{nft.aiEvolutionStage * 10}% Intelligence</span>
      </div>
    </div>
  );

  const StakingStatus = ({ nft }: { nft: NFT }) => (
    <div className="staking-section">
      <div className="staking-info">
        <span className="staking-label">
          {nft.isStaked ? '🔒 Staked' : '🔓 Available'}
        </span>
        {nft.isStaked && (
          <span className="rewards">💰 {nft.stakingRewards || 0} tokens</span>
        )}
      </div>
      {nft.isStaked && (
        <div className="progress-bar">
          <div style={{width: `${nft.stakingProgress || 0}%`}} className="progress"/>
        </div>
      )}
      <button 
        className="stake-btn"
        onClick={() => toggleStaking(nft.id)}
      >
        {nft.isStaked ? 'Unstake' : 'Stake NFT'}
      </button>
    </div>
  );

  // ✅ NEW: Documentation Modal
  const DocumentationModal = () => (
    <div className="modal-overlay" onClick={() => setShowDocumentation(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowDocumentation(false)}>✕</button>
        <div className="modal-header">
          <h2>📚 Platform Documentation</h2>
        </div>
        <div className="modal-body">
          <div className="doc-section">
            <h3>🚀 Getting Started</h3>
            <p>Welcome to Collaborative Dynamic NFTs! Follow these steps to begin:</p>
            <ol className="doc-list">
              <li><strong>Create an NFT:</strong> Click "Create AI NFT" to launch your project</li>
              <li><strong>Invite Collaborators:</strong> Share your NFT with other creators</li>
              <li><strong>AI Evolution:</strong> Watch your NFT evolve based on contributions</li>
              <li><strong>Stake & Earn:</strong> Stake NFTs to earn rewards and boost visibility</li>
            </ol>
          </div>
          
          <div className="doc-section">
            <h3>🤖 AI Features</h3>
            <p>Our AI system enhances your NFTs through:</p>
            <ul className="doc-list">
              <li>Smart contribution analysis</li>
              <li>Automated quality scoring</li>
              <li>Evolution stage progression</li>
              <li>Intelligent recommendations</li>
            </ul>
          </div>

          <div className="doc-section">
            <h3>👥 Collaboration Roles</h3>
            <div className="roles-grid">
              <div className="role-item">
                <span className="role-icon">🎨</span>
                <strong>Artist:</strong> Visual design, artwork, animations
              </div>
              <div className="role-item">
                <span className="role-icon">💻</span>
                <strong>Developer:</strong> Smart contracts, technical features
              </div>
              <div className="role-item">
                <span className="role-icon">🎵</span>
                <strong>Creator:</strong> Original content, music, writing
              </div>
              <div className="role-item">
                <span className="role-icon">📈</span>
                <strong>Marketer:</strong> Promotion, community building
              </div>
            </div>
          </div>

          <div className="doc-section">
            <h3>💡 Best Practices</h3>
            <ul className="doc-list">
              <li>Clearly define your project vision</li>
              <li>Welcome diverse skill sets</li>
              <li>Use the voting system fairly</li>
              <li>Engage in project chat regularly</li>
              <li>Monitor AI evolution progress</li>
            </ul>
          </div>

          <div className="doc-section">
            <h3>🔗 Quick Links</h3>
            <div className="links-grid">
              <a href="#" className="doc-link">🎯 Tutorial Videos</a>
              <a href="#" className="doc-link">💬 Community Discord</a>
              <a href="#" className="doc-link">🛠️ Developer API</a>
              <a href="#" className="doc-link">🎨 Design Assets</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LearnMoreModal = () => (
    <div className="modal-overlay" onClick={() => setShowLearnMore(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowLearnMore(false)}>✕</button>
        <div className="modal-header">
          <h2>🚀 Revolutionary Features</h2>
        </div>
        <div className="modal-body">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Evolution</h3>
              <p>NFTs adapt and evolve based on community contributions with intelligent insights.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <h3>Multi-Role Collaboration</h3>
              <p>Different contributor roles with specialized badges, permissions, and rewards.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🗳️</div>
              <h3>Community Voting</h3>
              <p>Democratic approval system where contributors vote on new additions.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>Integrated Chat</h3>
              <p>Real-time collaboration discussion with AI assistance and moderation.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💎</div>
              <h3>NFT Staking & Rewards</h3>
              <p>Stake NFTs to earn rewards, boost visibility, and unlock premium features.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Live Analytics Dashboard</h3>
              <p>Real-time insights into collaboration trends, performance metrics, and achievements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <header className="App-header">
        <div className="hero-badge">✨ Revolutionary AI-Powered Web3 Platform</div>
        <h1>Collaborative Dynamic NFTs</h1>
        <p>Transform static NFTs into living, breathing, AI-enhanced collaborative assets.</p>
        <div className="hero-buttons">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {showCreateForm ? '✕ Cancel' : '🚀 Create AI NFT'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowLearnMore(true)}
          >
            📚 Learn More
          </button>
        </div>
      </header>

      <main className="container">
        {showCreateForm && (
          <div className="form-card animate-fade-in-up">
            <h2 className="form-title">Create AI-Enhanced NFT</h2>
            <form onSubmit={createNFT}>
              <div className="form-group">
                <label className="form-label">Creator Wallet</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={newNFT.creator}
                  onChange={(e) => setNewNFT({...newNFT, creator: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="AI-Enhanced Symphony Collaboration"
                  value={newNFT.title}
                  onChange={(e) => setNewNFT({...newNFT, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vision Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe your AI-enhanced collaborative vision..."
                  value={newNFT.description}
                  onChange={(e) => setNewNFT({...newNFT, description: e.target.value})}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? '🤖 Creating...' : '🎯 Launch NFT'}
              </button>
            </form>
          </div>
        )}

        {/* ✅ FIXED: Enhanced Uniform Layout with Equal Heights */}
        <div className="enhanced-layout">
          {/* Left Column - NFT Showcase */}
          <div className="nft-column">
            {nfts.map((nft, index) => (
              <div key={nft.id} className="card nft-card animate-fade-in-up">
                <div className="card-header">
                  <div className="card-image">
                    <div className="card-placeholder">🎨</div>
                  </div>
                  <div className="card-badges">
                    <span className="category-badge">#{nft.category}</span>
                    <span className="activity-badge">{nft.lastActivity}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{nft.title}</h3>
                  <p className="card-info">
                    <span className="card-meta">Creator:</span> 
                    {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </p>
                  <p className="card-info">
                    <span className="card-meta">Vision:</span> {nft.description}
                  </p>
                  <p className="card-info">
                    <span className="card-meta">Collaborators:</span> {nft.contributions.length + 1}
                  </p>

                  <AIEvolutionDisplay nft={nft} />
                  <StakingStatus nft={nft} />
                </div>

                <div className="card-actions">
                  {nft.isOpen && (
                    <button 
                      onClick={() => handleContributeClick(nft.id)}
                      className={`btn btn-primary btn-sm ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳' : '+ Join Project'}
                    </button>
                  )}
                  <button 
                    onClick={() => toggleChat(nft.id)}
                    className={`btn btn-secondary btn-sm ${activeChatNFT === nft.id ? 'active' : ''}`}
                  >
                    💬 {activeChatNFT === nft.id ? 'Close' : 'Collaborate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Enhanced Analytics Dashboard */}
          <div className="analytics-column">
            <PlatformAnalytics />
          </div>
        </div>

        {nfts.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h2 className="empty-state-title">Ready to Create AI History?</h2>
            <p className="empty-state-text">
              Launch your first AI-enhanced collaborative NFT and pioneer the future!
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
              style={{ marginTop: '2rem' }}
            >
              🚀 Get Started
            </button>
          </div>
        )}
      </main>

      {/* Chat Panel */}
      {activeChatNFT !== null && nfts.find(n => n.id === activeChatNFT) && (
        <CollaborationChat nft={nfts.find(n => n.id === activeChatNFT)!} />
      )}

      {/* Modals */}
      {showLearnMore && <LearnMoreModal />}
      {showDocumentation && <DocumentationModal />} {/* ✅ NEW: Documentation modal */}
    </div>
  );
}

export default App;
