<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">

  <h1 align="center">BlackNode Sentinel</h1>

  <p align="center">
    AI-Powered Runtime Application Self-Protection (RASP) SaaS Platform
    <br />
    Intelligent • Real-Time • Secure
    <br /><br />
    <a href="https://github.com/Eagle-AS0/BlackNode-Sentinel"><strong>Explore the Project »</strong></a>
    <br /><br />
    <a href="https://github.com/Eagle-AS0/BlackNode-Sentinel">View Repository</a>
    ·
    <a href="https://github.com/Eagle-AS0/BlackNode-Sentinel/issues">Report Bug</a>
    ·
    <a href="https://github.com/Eagle-AS0/BlackNode-Sentinel/issues">Request Feature</a>
  </p>
</div>

---

## 📌 About The Project

BlackNode Sentinel is an AI-powered Runtime Application Self-Protection (RASP) platform built as a SaaS security solution.

It monitors web applications during runtime, detects malicious activity using intelligent analysis, and automatically blocks threats before they impact the system.

The goal is to provide real-time visibility, automated threat response, and security analytics for modern cloud-native applications.

---

## 🔐 Core Features (MVP)

- Runtime request monitoring
- Attack detection (SQL Injection, XSS, Injection patterns)
- Automatic threat blocking
- Security event logging
- Web-based analytics dashboard
- JWT-based authentication
- Multi-tenant SaaS architecture

---

## 🏗 Built With

### Backend
- Node.js (Express / NestJS)

### Frontend
- React

### AI Detection Engine
- Python (FastAPI + Scikit-learn)

### Database
- PostgreSQL

### Infrastructure
- Docker
- Cloud Deployment (AWS / GCP / Render)

---

## 🚀 System Architecture

Client Application  
↓  
RASP Agent (Middleware SDK)  
↓  
BlackNode Sentinel Cloud API  
↓  
Detection & Response Engine  
↓  
PostgreSQL (Logs & Analytics)  
↓  
Security Dashboard  

---

## ⚙ Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.9+)
- PostgreSQL
- Docker (optional)

---

### Installation

1. Clone the repository

```bash
git clone https://github.com/Eagle-AS0/BlackNode-Sentinel.git
cd BlackNode-Sentinel
