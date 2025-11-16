# MBaaS App — Backendless + React Demo

[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)
[![Backendless](https://img.shields.io/badge/MBaaS-Backendless-0b76b8.svg)](https://backendless.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3.svg)](https://getbootstrap.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet-green.svg)](https://leafletjs.com/)

A small but feature-rich practice application that demonstrates how to build a modern front end on top of a Mobile Backend as a Service (MBaaS) — **Backendless**.

The app includes user authentication, personal file storage, geolocated “places”, social features (friends, likes, friend requests), feedback via email, and Java server-side logic (events & timers) in Backendless.

![Screenshot](https://github.com/user-attachments/assets/55675cbe-374d-47ac-b0e6-fa0056bc02e6)

---

## Tech Stack

**Frontend**

- React
- React Router
- Bootstrap 5.3
- Font Awesome
- React Leaflet & Leaflet (maps)
- React-Select (Creatable) for categories/hashtags
- Axios (for some file operations)
- Backendless JS SDK

**Backend (MBaaS)**

- Backendless Data, Files, UserService, Messaging, Logging, Geo
- Backendless Server Code (Java):
  - Events (`AfterLoginEventHandler`)
  - Timers (`BirthdayTimer`)

---

## Features

- **Auth & Profile** — registration, login, session in `localStorage`, password reset via email, basic profile data.
- **File Manager** — per-user folders, uploads, downloads, delete, and sharing via special `shared_with_me` folder.
- **Places** — user-created locations with category, hashtags, images, likes, and map markers (current location or draggable marker).
- **Friends & Social** — friend requests, friends list, radius-based search, and friends map using stored `myLocation`.
- **Feedback** — in-app feedback form sending emails to the developer via `Backendless.Messaging.sendEmail`.
- **Server Logic in Java** — login statistics (`Statistic.usersOnline`) and daily birthday greeting emails via a Backendless timer.

---

## Getting Started

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm**
- A **Backendless** app (free tier is enough)

### 1. Clone & Install

```bash
git clone [https://github.com/vykhryst/readict.git](https://github.com/vykhryst/readict.git)
cd readict
npm install
```

### 2. Configure Backendless

In the Backendless console:

- Create an app and copy **APP ID** and **JS API Key**.
- Create basic tables used in the app (e.g. `Users`, `Places`, `Friends`, `FriendRequests`, `Likes`, `Statistic`, `Categories`, `Hashtags`) with fields that match usage in code.
- (Optional) Deploy Java server code from `servercode` if we want login statistics and birthday emails.

### 3. Environment Variables

Create `.env` in the project root:

```env
REACT_APP_BACKENDLESS_APP_ID=your-app-id
REACT_APP_BACKENDLESS_API_KEY=your-js-api-key
REACT_APP_BACKENDLESS_SERVER_URL=https://api.backendless.com
REACT_APP_DEVELOPER_EMAIL=your.email@example.com
```

### 4. Run the App

```bash
npm start
```

- App runs at **http://localhost:3000**
- Hot reload is enabled for development.

---

## Main Screens

- **Home** — entry point with navigation.
- **Register / Login / Reset Password** — authentication flow.
- **Profile** — user info and geolocation (`myLocation`) used in Friends/Places features.
- **File Manager** — tree-like list of user files & folders with upload, delete, share and download.
- **Places** — user’s places, “My Places” and search results with filters and likes.
- **Friends** — friend requests, friend list, search and a map of friends.
- **Feedback** — send a message directly to the developer email set in `.env`.

---

## Useful Scripts

From the project root:

- `npm start` — start dev server  
- `npm test` — run tests (if added)  
- `npm run build` — create production build  

---

## Author

**Oksana Vykhryst**  
Full-stack developer (Frontend + Backendless server code) and author of this MBaaS application.
