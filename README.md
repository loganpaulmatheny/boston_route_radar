# 🚦 Boston Route Radar

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

A civic web application that enables cities to crowdsource and track transportation infrastructure issues — potholes, broken signals, flooded bike lanes, and more. Built for Boston, designed to scale.

---

## 📋 Table of Contents

- [Objective](#objective)
- [Features](#features)
- [Upcoming Features](#upcoming-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Overview](#api-overview)
- [Design, Mockups, and Demo](#Design-Mockups-and-Demo)
- [Attributions and AI](#attributions)
- [Authors and Course Information](#authors-and-course-information)

---

## 🎯 Objective

### Course Objectives

Boston Route Radar is a full-stack web application built for CS5610 Web Development at Northeastern University. The project demonstrates:

- Building and consuming a Restful APIs with Node.js and Express
- Integrating a NoSQL database (MongoDB) for persistent storage
- Applying modern UI frameworks (Bootstrap) for aesthetically pleasing and responsive design
- Implementing full CRUD operations across multiple data collections
- Deploying the application and database

### Broader Objectives

Create a practical civic tool that:

- Empowers residents to report and track local infrastructure issues
- Gives city officials visibility into active, backlog, and resolved problems
- Surfaces city-led projects so the public can stay informed
- Bridges the gap between government and the communities they serve

---

## ✨ Features

### Issues Tracker

Residents can submit infrastructure issues (e.g. potholes, broken signals, downed signage) and view all active reports submitted by the community. Each issue card displays a photo, description, location, status, and a button to edit the information or delete the issue.

### City Projects Tracker

A page that will surface official city projects — infrastructure initiatives, road resurfacing plans, transit improvements, and more.

This feature brings transparency to city government by connecting residents with the work being done on their behalf.

### City Alerts

City administrators can post alerts that notify residents of known, ongoing disruptions — road closures, construction zones, service outages, and more.

### Filtering & Status Views

Issues can be browsed with filters to show all community issues or just your own submissions. Status indicators help distinguish between active, in-progress, and resolved reports.

---

## 🔧 Tech Stack

### Backend

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) **Node.js** — Runtime environment
- ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) **Express** — RESTful API server
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) **MongoDB** — NoSQL database for issues, alerts, and projects

### Frontend

- ![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white) **Bootstrap 5** — Responsive UI components and grid
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) **ES6+ JavaScript** — Dynamic rendering and API consumption
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) - Semantic page structure
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) - Styling

### Development

- **Git** — Version control
- **ESLint** — Code quality and consistency
- **Arch Linux + Neovim** — Development environment 😎

---

## 📁 Project Structure

```
boston_route_radar/
├── backend.js          # Express app entry point
├── routes/             # API route handlers
├── db/                 # MongoDB connection and helpers
├── data/               # Seed data / static assets
├── frontend/           # HTML pages and client-side JS
├── .gitignore
├── package.json
└── README.md
```

---

## 💻 Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas URI)
- Git

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/loganpaulmatheny/boston_route_radar.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd boston_route_radar
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure environment variables:**

   Create a `.env` file in the root directory:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

5. **Start the server:**

   ```bash
   node backend.js
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🔌 API Overview

| Method   | Endpoint          | Description                         |
| -------- | ----------------- | ----------------------------------- |
| `GET`    | `/api/issues`     | Fetch all infrastructure issues     |
| `POST`   | `/api/issues`     | Submit a new issue                  |
| `PUT`    | `/api/issues/:id` | Update an issue                     |
| `DELETE` | `/api/issues/:id` | Delete an issue                     |
| `GET`    | `/api/projects`   | _(Coming Soon)_ Fetch city projects |

---

## 🎨 Design, Mockups, and Demo

#### [Design Document](https://docs.google.com/document/d/1mQpv4x2_FTDfwvrKBbPpvTOqKNteUNoMVR5khnlfjzI/edit?usp=sharing)

#### [Presentation](https://docs.google.com/presentation/d/1qXckxGZW3NcSI1Ku2qwDHa9Wfr39dWP4maF2xt38PYk/edit?usp=sharing)

#### [Demo]()

The application design was informed by the work completed in Prof. Gomez's Course, as well as Bootstrap's card and carousel templates - adapted to create a clean, modern civic interface. Mockups for both the Issues page (scrollable card grid with status badges and action buttons) and the Projects page (dark-themed card grid for city priorities) were created during the design phase and presented as part of the CS5610 project slides.

---

## Attributions

### Creator Attributions

-- put them here --

## 🤖 AI Assistance

AI tools were used strategically throughout development to accelerate work and improve quality.

### How AI Was Used

**README Documentation** — Claude AI was used to help structure and format this README based on project details and a preferred style from a prior project. The repository owners then made adjustments and modifications as necessary.

**Debugging & Troubleshooting** — AI assisted with diagnosing Express routing issues, MongoDB query patterns, and Bootstrap layout behavior.

**Deployment** - AI was used to assist in the deployment process as this is one of the contributors first deploying with Render.

### AI Usage Philosophy

AI was used as a **development accelerator**, not a shortcut. All generated code was reviewed, understood, and integrated intentionally. The goal was to spend less time on boilerplate and more time building features that matter.

---

## 👨‍💻 Authors and Course Information

**Logan Matheny**

- 🎓 Graduate Student, M.S. Computer Science — Northeastern University
- 🪖 West Point Graduate and U.S. Army Veteran
- 💼 [LinkedIn](https://www.linkedin.com/in/logan-matheny/)
- 🐙 [GitHub](https://github.com/loganpaulmatheny)

**Pratyusha Jaitly**

- 🎓 Graduate Student, M.S. Computer Science — Northeastern University
- 🐙 [GitHub](https://github.com/pratyushajaitly)

**Course Information**

- **Course**: CS5610 Web Development
- **Semester**: Spring 2026
- **Instructor**: John Guerra
- **Course Website**: [CS5610 Online Spring 2026](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

**Made with 🦺 by Logan Matheny & Pratyusha Jaitly**

_Last Updated: February 2026_
