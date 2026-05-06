# NJUPT Campus Map — 南京邮电大学仙林校区地图

An interactive, bilingual campus map for the **Xianlin Campus** of Nanjing University of Posts and Telecommunications (NJUPT), built especially for international students.

![NJUPT Xianlin Campus Map](https://github.com/user-attachments/assets/b20244dd-a1c8-471e-850b-84f66e5db6a9)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Interactive map** | Leaflet.js + CartoDB base tiles + campus image overlay |
| **60 + POIs** | Gates, admin buildings, classrooms, canteens, courier stations, ATMs, clinic, supermarket, sports, dormitories, landmarks |
| **Search** | Real-time bilingual search across names, descriptions, and tags |
| **Category filters** | Toggle individual POI categories on/off |
| **Quick-view presets** | *All*, *New Student* (essential spots), *Daily Life* (services) |
| **Bilingual UI** | Full English ↔ Chinese (Simplified) toggle |
| **Dark / Light theme** | One-click theme switch with matching map tiles |
| **Map overlay toggle** | Show or hide the campus illustration overlay |
| **Mobile responsive** | Sidebar slides in as a drawer; large touch targets |
| **Locate me** | Uses browser Geolocation API |

---

## 🚀 Getting Started

No build tools or API keys required. Just open `index.html` in a browser:

```bash
# Option 1 — open directly
open index.html

# Option 2 — local dev server (avoids any CORS quirks)
npx serve .
# or
python3 -m http.server 8080
```

---

## 📁 Project Structure

```
NJUPT-Campus-Map/
├── index.html          # App shell — layout, map container, sidebar
├── css/
│   └── style.css       # All styles (light & dark themes, responsive)
└── js/
    ├── data.js         # POI data — coordinates, descriptions, tags (EN + ZH)
    ├── i18n.js         # Translation strings & language helpers
    └── app.js          # Map init, markers, search, filters, detail panel
```

---

## 🗺️ POI Categories

| Icon | Category | Examples |
|------|----------|---------|
| 🚪 | Gates | South Gate (Main), North Gate, East Gate, West Gate |
| 🏛️ | Administration | Admin South/North, International Students Office (ISU) |
| 🎓 | Academic | Teaching Bldgs 1–5, Library, Student Activity Center, School buildings |
| 🍜 | Dining | South Canteen, North Canteen (S1/S2/S3, with Halal section) |
| 📦 | Courier | JD Express, SF Express, Cainiao (Alibaba), China Post / EMS |
| 🔧 | Services | ATMs, Campus Clinic, Supermarket, Bookstore, Bike Repair, Mobile Top-Up |
| ⚽ | Sports | Gymnasium, North/South Sports Fields, Basketball Courts |
| 🏠 | Dormitories | Buildings 1–45 + North Cluster (7–19) |
| 🗿 | Landmarks | Zhongbo Lake, Wishing Tree, Ding Hill, Flag Square |

---

## 🌐 Roadmap

- [x] **Phase 1** — Static POI data, image overlay, bilingual search & filters
- [ ] **Phase 2** — Mapbox GL JS integration for true 3D building extrusion
- [ ] **Phase 2** — Low-poly GLTF models for iconic buildings (Library, Admin)
- [ ] **Phase 3** — PWA support (offline-capable, installable)
- [ ] **Phase 3** — Indoor navigation & floor plans

---

## 🙏 Credits

- Map illustration: NJUPT official campus map
- Base tiles: [CartoDB](https://carto.com) / [OpenStreetMap](https://www.openstreetmap.org)
- Map engine: [Leaflet.js](https://leafletjs.com)
- Fonts: [Inter](https://rsms.me/inter/) via Google Fonts
