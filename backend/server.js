const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory NFT list with demo NFT to display on UI
let nfts = [
  {
    id: 1,
    creator: "0x1234...abcd",
    title: "Demo NFT",
    description: "A sample NFT for testing your UI!",
    metadataURI: `http://localhost:${PORT}/api/metadata/1`,
    contributions: [],
    isOpen: true,
    createdAt: new Date()
  }
];
let nextId = 2;

// Root route - for API status check
app.get('/', (req, res) => {
  res.json({
    message: '🎨 Collaborative NFT API is running!',
    endpoints: {
      'GET /api/nfts': 'Get all NFTs',
      'POST /api/nfts': 'Create new NFT',
      'GET /api/metadata/:id': 'Get NFT metadata',
      'POST /api/nfts/:id/contribute': 'Add contribution'
    }
  });
});

// Create NFT
app.post('/api/nfts', (req, res) => {
  const { creator, title, description } = req.body;
  if (!creator || !title || !description) {
    return res.status(400).json({ success: false, message: 'creator, title, and description are required.' });
  }
  const nft = {
    id: nextId,
    creator,
    title,
    description,
    metadataURI: `http://localhost:${PORT}/api/metadata/${nextId}`,
    contributions: [],
    isOpen: true,
    createdAt: new Date()
  };
  nfts.push(nft);
  nextId++;
  res.status(201).json({ success: true, nft });
});

// Get all NFTs
app.get('/api/nfts', (req, res) => {
  res.json(nfts);
});

// Get NFT metadata
app.get('/api/metadata/:id', (req, res) => {
  const nft = nfts.find(n => n.id == req.params.id);
  if (!nft) return res.status(404).json({ error: 'Not found' });

  res.json({
    name: nft.title,
    description: nft.description,
    image: "https://via.placeholder.com/300x300.png?text=Collaborative+NFT",
    attributes: [
      { trait_type: "Creator", value: nft.creator },
      { trait_type: "Contributors", value: nft.contributions.length },
      { trait_type: "Status", value: nft.isOpen ? "Open" : "Closed" }
    ]
  });
});

// Add a contribution to an NFT
app.post('/api/nfts/:id/contribute', (req, res) => {
  const { contributor, contributionType } = req.body;
  const nft = nfts.find(n => n.id == req.params.id);

  if (!nft) return res.status(404).json({ error: 'NFT not found' });
  if (!contributor || !contributionType) {
    return res.status(400).json({ success: false, message: 'contributor and contributionType required.' });
  }

  nft.contributions.push({
    contributor,
    contributionType,
    timestamp: new Date()
  });

  res.json({ success: true, nft });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
