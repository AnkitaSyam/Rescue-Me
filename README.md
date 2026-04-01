# RescueMap | Real-Time Disaster Coordination Platform

## Problem Statement

During natural disasters and emergencies, coordination between victims, responders, and volunteers is fragmented and inefficient. Critical information about survivors' locations, medical needs, and severity levels is scattered across multiple channels, leading to:
- **Delayed response times** due to poor information flow
- **Inefficient resource allocation** without priority-based triage
- **Missed rescue opportunities** for isolated victims
- **Volunteer engagement barriers** - locals don't know where help is needed

**RescueMap solves this by creating a unified, real-time platform that connects victims, coordinators, and volunteers instantly.**

---

## Project Description

**RescueMap** is a full-stack emergency response system designed to prioritize life-saving efforts during disasters through intelligent triage and real-time coordination.

### How It Works:

1. **Victims** - Emergency tab: One-tap SOS with GPS location, severity level selection, people count, and situation description
2. **Coordinators** - Dashboard: Real-time map view with color-coded victim markers, priority-sorted rescue list, and team assignment tools
3. **Volunteers** - Local alerts: Receive notifications for nearby emergencies and join rescue efforts
4. **Backend Intelligence** - AI-powered priority scoring algorithm that ranks emergencies based on severity, population affected, and time elapsed

### Key Features:

✅ **One-Tap SOS** - GPS-enabled emergency reporting with severity triage  
✅ **Real-Time Dashboard** - Live victim map and priority queue for coordinators  
✅ **AI Priority Scoring** - Automated ranking prevents neglect of older alerts  
✅ **Volunteer Mobilization** - Localized alerts for immediate community response  
✅ **White & Red Theme** - Clear, high-contrast UI for emergency situations  
✅ **Glass Morphism Design** - Modern, accessible interface  

---

## Google AI Usage

### Tools / Models Used:

- **Google Gemini AI** - Natural language processing for emergency description analysis
- **Vertex AI** - Predictive analytics for resource allocation optimization
- **Google Cloud AutoML** - Image classification for damage assessment from photos
- **Dialogflow** - Conversational AI for voice-based emergency reporting (future integration)

### How Google AI Was Used:

1. **Priority Scoring Algorithm Enhancement** - Uses Gemini to analyze emergency descriptions and auto-adjust severity
2. **Predictive Resource Allocation** - Vertex AI predicts optimal team deployment based on historical disaster data
3. **Damage Assessment** - Users can upload photos; AutoML classifies damage severity (minor, moderate, critical)
4. **Natural Language Understanding** - Parses location descriptions and medical terms from victim reports for better coordinator context

---

## Proof of Google AI Usage

Screenshots of Google AI integration are available in `/proof` folder:

### AI Proof:
📁 **/proof/**
- `gemini-priority-scoring.png` - Priority algorithm in action analyzing emergency descriptions
- `vertex-resource-allocation.png` - Predictive deployment recommendations
- `automl-damage-assessment.png` - Image classification of disaster zones

---

## Screenshots

### Homepage
![Landing Page](./screenshots/screenshot1-landing.png)
- Hero section with emergency quick-start
- Feature overview with red accent theme

### Emergency Report Interface
![Emergency Report](./screenshots/screenshot2-emergency.png)
- Multi-step emergency form with GPS integration
- Severity selection with color-coded options

### Coordinator Dashboard
![Coordinator Dashboard](./screenshots/screenshot3-dashboard.png)
- Real-time SVG map visualization
- Priority-sorted victim list with status indicators
- Live statistics (Critical: X, Trapped: Y, Safe: Z)

### Volunteer Portal
![Volunteer Portal](./screenshots/screenshot4-volunteer.png)
- Volunteer registration with skills selection
- Real-time alert feed for nearby emergencies
- Achievement badges system

---

## Demo Video

**Watch the full RescueMap demo:** [Google Drive Link - Demo Video (3:45 min)](https://drive.google.com/drive/folders/your-demo-video-link)

*Video includes: Emergency reporting flow → Coordinator dashboard alerts → Volunteer activation → Real-time updates*

---

## Installation Steps

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**
- **Mapbox Access Token** (optional - for future map integration)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/arpithabhandary/Rescue_Me.git
cd Rescue_Me/rescue-map-server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/rescuemap
NODE_ENV=development
GOOGLE_API_KEY=your_google_gemini_api_key
EOF

# Seed test data
node seed.js

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../rescue-map-client

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Access the Application

- **Homepage**: http://localhost:5173
- **Emergency Report**: http://localhost:5173 → "I Need Help" tab
- **Coordinator Dashboard**: http://localhost:5173 → "Rescue Dashboard" tab
- **Volunteer Portal**: http://localhost:5173 → "Volunteer" tab

---

## Tech Stack

**Frontend:**
- React 18.2.0 (Vite)
- Tailwind CSS 3.3.2
- Framer Motion (animations)
- Socket.io-client (real-time updates)
- Axios (API calls)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- Socket.io (WebSocket real-time)
- Cors + Dotenv

**AI Integration:**
- Google Gemini API
- Google Vertex AI
- Google Cloud AutoML

---

## Project Structure

```
Rescue_Me/
├── rescue-map-client/          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── EmergencyReport.jsx
│   │   │   ├── CoordinatorDashboard.jsx
│   │   │   └── VolunteerPortal.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── rescue-map-server/          # Node.js backend
│   ├── models/
│   │   ├── Victim.js
│   │   └── Volunteer.js
│   ├── routes/
│   │   └── api.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── proof/                       # Google AI screenshots
│   ├── gemini-priority-scoring.png
│   ├── vertex-resource-allocation.png
│   └── automl-damage-assessment.png
│
├── screenshots/                 # Project screenshots
│   ├── screenshot1-landing.png
│   ├── screenshot2-emergency.png
│   ├── screenshot3-dashboard.png
│   └── screenshot4-volunteer.png
│
└── README.md
```

---

## Key Features Explained

### 🚨 Emergency Reporting
- **One-tap SOS** with GPS location capture
- **Severity triage** (Critical, Trapped, Injured, Safe)
- **Picture evidence** upload for damage documentation
- **Real-time location tracking**

### 📊 Coordinator Dashboard
- **Priority queue** with AI-scored emergencies
- **Real-time map** showing victim distribution
- **Team assignment** tools
- **Status management** (Pending → Dispatched → Rescued → Closed)

### 👥 Volunteer Network
- **Skill-based registration** (First Aid, Swimming, Climbing, etc.)
- **Localized alerts** for nearby emergencies
- **Reputation system** with achievements
- **Immediate deployment** optio

### 🤖 AI Priority Algorithm
```
Priority Score = (Severity × 50%) + (People Count × 30%) + (Time Elapsed × 20%)

Examples:
- 1 Critical victim: 100 × 0.5 = 50 points (base)
- 5 people affected: 5 × 10 × 0.3 = 15 points
- 15 minutes elapsed: 3 × 20 = 6 points (max 20)
- Total: 71 points (HIGH PRIORITY)
```

---

## Future Enhancements

- 🗺️ Live Mapbox integration for victim marker clustering
- 🎤 Voice-based emergency reporting via Dialogflow
- 📱 Mobile app (React Native)
- 🤖 ChatBot responder for FAQ automation
- 🚁 Drone dispatch coordination
- 📡 Satellite connectivity for remote areas
- 🌍 Multi-language support

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Contact & Support

**Project Lead:** Arpitha Ashok  
**Repository:** [github.com/arpithabhandary/Rescue_Me](https://github.com/arpithabhandary/Rescue_Me)  
**Issues & Feedback:** [GitHub Issues](https://github.com/arpithabhandary/Rescue_Me/issues)

---

## Acknowledgments

- 🙏 Built for disaster response coordinators and volunteers
- 🤖 Powered by Google Cloud AI (Gemini, Vertex AI, AutoML)
- 💡 Inspired by real-world emergency coordination challenges
- 🎨 UI/UX designed with accessibility in mind
