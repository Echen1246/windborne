# WindBorne Balloon Constellation Tracker

A real-time visualization of WindBorne Systems' global weather balloon constellation, combining live balloon telemetry with weather data to create an interactive globe view.

## About WindBorne Systems

WindBorne Systems operates a constellation of weather balloons that collect atmospheric data worldwide to improve weather forecasting. Their balloons drift at various altitudes (2-25 km) collecting measurements across all continents and oceans. This project visualizes their global fleet in real-time.

## Tech Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Build Tool**: Vite (fast HMR, ES modules)
- **Mapping**: MapBox GL JS with globe projection
- **Deployment**: Vercel (with serverless functions)
- **Styling**: Pure CSS with dark theme

## APIs Used

### 1. WindBorne Constellation API
- **Endpoint**: `https://a.windbornesystems.com/treasure/XX.json` (00-23)
- **Data**: Live balloon positions `[latitude, longitude, altitude_meters]`
- **Coverage**: 24 hours of historical data (one file per hour)
- **Update Frequency**: Hourly
- **Challenge**: No CORS headers, requiring server-side proxy

### 2. Open-Meteo Weather API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data**: Current weather conditions (temperature, wind speed/direction, conditions)
- **Purpose**: Correlate balloon positions with local weather
- **Advantage**: Free, no API key required

## How It Works

### Data Fetching
1. **Proxy Layer**: Vite dev proxy (development) and Vercel serverless functions (production) bypass CORS restrictions
2. **Parallel Requests**: Fetch all 24 hourly balloon data files simultaneously using `Promise.allSettled()`
3. **Error Handling**: Gracefully handle corrupted or missing data files
4. **Weather Enrichment**: Fetch real-time weather data for balloon positions on-click

### Data Visualization

#### Heatmap Layer
- Aggregates all 24 hours of position data into a density heatmap
- Shows high-activity zones where balloons frequently traverse
- Customizable color schemes (6 presets: purple, blue-red, green-red, etc.)
- Powered by MapBox's native heatmap layer for performance

#### Marker Layer
- Displays current balloon positions (from `00.json`)
- Color-coded by altitude (blue = low, red = high)
- Interactive popups showing position, altitude, and local weather
- Size scales with zoom level for clarity

#### Globe Projection
- MapBox GL JS globe view with atmosphere
- Smooth 3D rotation and zoom
- Natural terrain colors (green land, blue oceans)

### Filtering & Controls

**Interactive filters:**
- Altitude range (0-25 km)
- Time range (1-24 hours)
- Geographic regions (continents + oceans)
- Layer visibility toggles

**Real-time updates:**
- Auto-refresh every 60 minutes
- Smooth filter transitions
- Responsive filter panel (collapsible)

## Architecture

```
┌─────────────────┐
│  Browser Client │
│   (Vanilla JS)  │
└────────┬────────┘
         │
         ├─→ Vite Proxy (dev) ──→ WindBorne API
         │   Vercel Functions    
         │   (production)
         │
         └─→ Open-Meteo API (direct)
                ↓
         ┌──────────────┐
         │  MapBox GL   │
         │  Rendering   │
         └──────────────┘
```

## Key Features

- **1000+ Balloon Positions**: Real-time tracking of entire constellation
- **24-Hour History**: Visualize balloon movement patterns over time
- **Weather Context**: See conditions at balloon locations
- **Interactive Globe**: Smooth 3D navigation
- **Customizable Colors**: Choose your preferred heatmap palette
- **Responsive Design**: Works on desktop and mobile
- **Auto-refresh**: Always shows latest data

## Development

```bash
# Install dependencies
npm install

# Start dev server (with proxy)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Deployment

Deployed on Vercel with:
- Serverless function at `/api/balloons` to proxy WindBorne API
- Static site generation for frontend
- Automatic deployments from git

## Design Decisions

**Why Vanilla JS?**  
Clean, performant, no framework overhead. Perfect for focused visualization.

**Why Open-Meteo?**  
Free weather API with excellent coverage. No API key hassles.

**Why Proxy Layer?**  
WindBorne's API doesn't support CORS. Serverless function acts as intermediary.

**Why Heatmap vs Trajectories?**  
Individual balloon tracking requires unique IDs (not provided in API). Heatmap shows aggregate activity patterns effectively.

**Why Hourly Refresh?**  
Matches WindBorne's data update frequency. No need for excessive polling.

---

Built for WindBorne Systems Junior Web Developer application.
