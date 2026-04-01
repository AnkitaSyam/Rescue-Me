# Rescue-Me | Disaster Response & Coordination Platform

## Problem Statement
During natural disasters and emergencies, coordination between victims, responders, and volunteers is fragmented and inefficient. Critical information about survivors' locations, medical needs, and severity levels is scattered across multiple channels, leading to:
- **Delayed response times** due to poor information flow
- **Inefficient resource allocation** without priority-based triage
- **Missed rescue opportunities** for isolated victims
- **Volunteer engagement barriers** - locals don't know where help is needed

**RescueMap solves this by creating a unified, real-time platform that connects victims, coordinators, and volunteers instantly.**

## Project Description
**RescueMap** is a full-stack emergency response system designed to prioritize life-saving efforts during disasters through intelligent triage and real-time coordination.

### How it works:
1.  **Victims**: Use the Emergency tab to one-tap SOS with GPS location, severity level selection, and situation description.
2.  **Coordinators**: Access a real-time dashboard with a map view, color-coded victim markers, and priority-sorted rescue lists.
3.  **Volunteers**: Receive localized alerts for nearby emergencies and join rescue efforts with skill-based deployment.
4.  **Backend Intelligence**: An AI-powered priority scoring algorithm ranks emergencies based on severity, population affected, and time elapsed.

## Google AI Usage
### Tools / Models Used
- **Google Gemini API**: Natural language processing for emergency description analysis.
- **Vertex AI**: Predictive analytics for resource allocation optimization.
- **Google Cloud AutoML**: Image classification for damage assessment from photos.

### How Google AI Was Used
1.  **Priority Scoring Enhancement**: Uses Gemini to analyze emergency descriptions (e.g., "water rising fast", "medical emergency") and auto-adjust severity scores.
2.  **Predictive Resource Allocation**: Vertex AI predicts optimal team deployment based on historical disaster data and live traffic/terrain conditions.
3.  **Damage Assessment**: Users can upload photos; AutoML classifies damage severity (minor, moderate, critical) to prioritize the most devastated areas.
4.  **Natural Language Understanding**: Parses location descriptions and medical terms from victim reports for better coordinator context.

## Proof of Google AI Usage
Attach screenshots in a /proof folder:

### AI Proof
- **Gemini Priority Scoring**: [proof/gemini-priority-scoring.png](./proof/gemini-priority-scoring.png)
- **Vertex Resource Allocation**: [proof/vertex-resource-allocation.png](./proof/vertex-resource-allocation.png)
- **AutoML Damage Assessment**: [proof/automl-damage-assessment.png](./proof/automl-damage-assessment.png)

## Screenshots
### Screenshot1: Landing Page
![Landing Page](C:\Users\GESY P MOHAN\Rescue-Me\Landing Page.jpeg)

### Screenshot2: Dashboard
![Dashboard](C:\Users\GESY P MOHAN\Rescue-Me\screenshot2.jpeg)

### Screenshot3: Volunteer
![Volunteer](C:\Users\GESY P MOHAN\Rescue-Me\screenshot3.jpeg)
---
*Note: Please ensure files are placed in the `/proof` and `/screenshots` directories to display correctly.*
