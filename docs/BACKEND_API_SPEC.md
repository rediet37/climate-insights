# Climate Insights Frontend Backend Integration Specification

Version: 1.0  
Updated: 2025-10-06

This document defines the backend contracts required by the current frontend implementation (`climate-insights`) so a backend developer can implement compatible services without reverse-engineering the UI code.

---
## 1. High-Level Feature Overview
| Feature | Purpose | Backend Dependency |
|---------|---------|--------------------|
| Category & Subcategory Selection | User chooses climate variable & index | Endpoint namespaces (rainfall, temperature, drought) |
| Timeframe Picker | Restricts year range for time-series queries | `available-range` + validation logic |
| Pickers (Day / Month / Season / Year) | Selects a temporal key (`selectedKey`) | Parameter parsing in raster & timeseries endpoints |
| Raster Map Layer | Displays spatial visualization for most subcategories | `/{category}/{subcategory}/raster-image` |
| Time-Series Chart | Plots values across years for a period & focus | `/{category}/{subcategory}/timeseries` |
| Anomaly Toggle | Swaps normal metric vs anomaly values | Optional `anomaly=true` param support |
| Region Selection | Aggregate over named admin region | Region name param (inside `params.region`) |
| Custom Geometry | Aggregate over user-drawn polygon | GeoJSON geometry in request body |
| Legend | Displays numeric range + unit for raster layers | `legend` object in raster response |
| Drought Indices (CDD/CWD/SPI/SPEI) | Specialized precipitation-derived indices | Custom logic & endpoint availability |
| Climatology View | Static multi-year baseline display (chart only) | (Planned) specialized timeseries / summary endpoint |

---
## 2. Environment & Configuration
Frontend reads:
- `process.env.NEXT_PUBLIC_API_BASE_URL` (client-side). Must be CORS-accessible and support POST & GET.

All API URLs are built as:  
```
${BASE_URL}/${category}/${subcategory}/(timeseries|raster-image)
${BASE_URL}/${category}/available-range
```

Supported `category` values (frontend):
- `rainfall`
- `temperature`
- `drought`

Supported `subcategory` values by category:
```
rainfall:    daily, monthly, seasonal, annual, climatology
temperature: daily, monthly, seasonal, annual, climatology
drought:     cdd, cwd, spi, spei
```

---
## 3. Temporal Key (`selectedKey`) Semantics
The frontend derives a `selectedKey` string whose format depends on the active subcategory:
| Subcategory | Format | Example | Used In |
|-------------|--------|---------|---------|
| daily | YYYY-MM-DD | 2024-07-15 | Raster + Timeseries (with month/day passed separately) |
| cdd / cwd | YYYY-MM-DD | 2024-07-15 | Treated like daily (needs month & day) for timeseries; raster required |
| monthly | YYYY-MM | 2024-07 | Raster + Timeseries (month) |
| spi / spei | YYYY-MM | 2024-07 | Timeseries only (month) – NO raster |
| seasonal | SEASON-YYYY | JJAS-2024 | Raster + Timeseries (season) |
| annual | YYYY | 2024 | Raster + Timeseries (year) |
| climatology | (none) | (none) | Special handling (chart only; currently hidden or placeholder) |

---
## 4. Endpoint Specifications
### 4.1 Available Date Range
```
GET /{category}/available-range
```
Used by all pickers to constrain user input. For `drought`, the frontend *currently* calls `rainfall/available-range` (can be replaced with a dedicated endpoint later).

Response:
```json
{
  "start": "1981-01-01",
  "end":   "2024-12-31"
}
```
- `start` / `end` MUST be ISO date strings (YYYY-MM-DD) even if monthly/annual data are served.
- The frontend truncates to `YYYY-MM` or `YYYY` as needed.

Errors:
- 500 server failure: frontend displays generic load error.

### 4.2 Raster Image
```
POST /{category}/{subcategory}/raster-image
```
NOT called for subcategories: `climatology`, `spi`, `spei`.

Request Body:
```json
{
  "params": {
    "year": "2024",          // daily/monthly/seasonal/annual/cdd/cwd
    "month": "07",            // daily, monthly, cdd, cwd
    "day": "15",              // daily, cdd, cwd
    "season": "JJAS",         // seasonal only
    "anomaly": true,           // optional if user toggled anomaly (not sent for cdd/cwd after UI change)
    "region": "Tigray"        // optional if a named region selected
  },
  "geometry": {                // optional GeoJSON Polygon/MultiPolygon if user drew a custom area
    "type": "Polygon",
    "coordinates": [[[40,9],[40.5,9],[40.5,9.5],[40,9.5],[40,9]]]
  }
}
```
Notes:
- `region` is nested inside `params` (current frontend behavior). Backend SHOULD accept it there. (You may also accept top-level for future flexibility.)
- Either `region` OR `geometry` may be present (never both by design). If both appear, prefer `geometry`.
- `anomaly` is only sent when user toggles it AND subcategory supports anomalies (excluded for cdd/cwd now).

Response:
```json
{
  "image": "https://cdn.example.com/tiles/run123/raster_2024_07_15.png",
  "bounds": [[3.0, 32.9], [14.5, 48.2]],
  "legend": { "min": 0.12, "max": 56.89, "unit": "mm" }
}
```
Requirements:
- `image`: Fully qualified URL or data URI (`data:image/png;base64,...`). PNG or WebP recommended.
- `bounds`: SouthWest + NorthEast coordinate pairs for Leaflet `LatLngBounds`.
- `legend.min/max`: numbers (can be negative for anomalies); must satisfy `min <= max`.
- `legend.unit`: short string (e.g., `mm`, `°C`, `days`).

Error Handling:
- 404 if no data for parameter combination (frontend shows tooltip error).
- 400 if malformed params.
- 500 unexpected errors.

### 4.3 Timeseries
```
POST /{category}/{subcategory}/timeseries
```
Called for ALL subcategories except none for which user hasn't provided required inputs. Climatology currently uses a different component (and may require a future endpoint; see section 9).

Request Body Template:
```json
{
  "params": {
    "start_year": "1990",
    "end_year": "2024",
    "month": "07",       // monthly, spi, spei, daily, cdd, cwd
    "day": "15",         // daily, cdd, cwd
    "season": "JJAS",    // seasonal
    "anomaly": true,      // optional
    "region": "Tigray"   // optional
  },
  "geometry": { ...optional GeoJSON... }
}
```
Parameter Matrix:
| Subcategory | Required Params Inside `params` | Optional |
|-------------|----------------------------------|----------|
| daily | start_year, end_year, month, day | anomaly, region |
| cdd/cwd | start_year, end_year, month, day | region |
| monthly | start_year, end_year, month | anomaly, region |
| spi/spei | start_year, end_year, month | (no anomaly in current UI) region |
| seasonal | start_year, end_year, season | anomaly, region |
| annual | start_year, end_year | anomaly, region |
| climatology | (TBD future) | - |

Response:
```json
{
  "data": [12.3, 14.1, 9.0, null, 18.2],
  "period": [1990, 1994]
}
```
Constraints:
- `period[0]` and `period[1]` inclusive range MUST match `data.length`.
- `data` entries may be `null` to indicate missing years (frontend handles gracefully).
- Values represent aggregated metric for the selected temporal slice across each year.

Errors:
- 400 invalid parameters.
- 404 no series found.
- 500 internal error.

---
## 5. Drought Index Specifics
| Index | Raster? | Timeseries Param Style | Notes |
|-------|---------|------------------------|-------|
| CDD (Consecutive Dry Days) | Yes | daily-like (month+day) | Anomaly toggle disabled in UI |
| CWD (Consecutive Wet Days) | Yes | daily-like (month+day) | Anomaly toggle disabled |
| SPI (Standardized Precipitation Index) | No | monthly-like (month) | Provide standardized values per year |
| SPEI (Standardized Precipitation Evapotranspiration Index) | No | monthly-like (month) | Same semantics as SPI |

### 5.1 Value Ranges (Recommendation)
- SPI / SPEI typically range ~ -3 to +3. Ensure backend caps extreme statistical outliers.
- CDD/CWD return counts in days (integers acceptable; floats allowed but not required).
- Provide `unit` in raster legend: use `days` for CDD/CWD.

---
## 6. Region & Geometry Handling
### 6.1 Region Names
Frontend maps internal codes to human names only for display; it sends the `name` string (e.g., "Tigray") in `params.region` if a region is selected.

Backend MUST:
- Accept the human-readable region name.
- Return 400 or 404 if unknown.
- Optionally support case-insensitivity.

### 6.2 Custom Geometry
When a user draws an area, the frontend sends the raw GeoJSON geometry under top-level `geometry` (not inside `params`). Backend should:
- Validate geometry type: Polygon or MultiPolygon.
- Possibly simplify or clip internally.
- Perform spatial aggregation (mask + aggregate statistic) prior to producing raster/time-series.

If both `geometry` and `region` appear, prefer `geometry` (frontend avoids this scenario).

---
## 7. Anomalies
Anomalies appear only where UI allows toggle (all non-drought daily/monthly/seasonal/annual subcategories currently). When `anomaly=true`:
- Raster: Provide anomaly values (baseline methodology not encoded in frontend; backend defines reference period—recommend returning it via header `X-Baseline-Period: 1991-2020`).
- Timeseries: Return anomaly numbers aligned with same period structure.
- Legend: Must reflect anomaly range (can include negatives). The diverging gradient is always used now—consider sending a hint if all-positive/all-negative so frontend could adapt later.

---
## 8. Legend Requirements
Returned only via raster endpoint. Each raster response MUST have:
```json
"legend": { "min": <number>, "max": <number>, "unit": "..." }
```
Backend responsibilities:
- Ensure `min <= max`.
- Ensure finite numeric values.
- Provide meaningful `unit` (consistent by subcategory). Examples:
  - Rainfall: `mm`
  - Temperature: `°C`
  - CDD/CWD: `days`
  - Seasonal rainfall: `mm`

No legend is shown for: `climatology`, `spi`, `spei` (frontend suppresses automatically by subcategory logic + absence of raster calls).

---
## 9. Climatology (Planned Enhancement)
Frontend includes a `climatology` subcategory for rainfall & temperature:
- Currently shows a separate component (no endpoint implemented in the provided code).
- Suggest backend endpoint: `/{category}/climatology/summary` with params: `{ month?: "07", region?: "Tigray", geometry?: GeoJSON }` or multi-month response.
- Potential Response Example:
```json
{
  "monthly_means": [ {"month":1,"value":12.3}, ... {"month":12,"value":34.5} ],
  "baseline_period": [1991, 2020],
  "unit": "mm"
}
```

---
## 10. Error Response Format (Recommended)
Standardize error JSON so frontend can optionally surface messages later:
```json
{
  "error": {
    "code": 404,
    "message": "No data for given parameters",
    "details": { "params": { ...originalParams } }
  }
}
```

---
## 11. Performance & Delivery Guidelines
| Aspect | Recommendation |
|--------|----------------|
| CORS | Allow origins for deployed frontend domains + localhost dev |
| Compression | Enable gzip/br on JSON responses |
| Caching (Raster) | Cache headers with ETag or versioned URLs; allow CDN edge | 
| Raster Format | PNG for lossless numeric meaning; WebP for speed if quality retained |
| Timeseries Latency | Target < 500 ms for typical queries |
| Aggregation | Pre-compute seasonal & monthly aggregates to reduce on-demand cost |
| Anomaly Computation | Pre-cache baselines to avoid runtime overhead |

---
## 12. Security Considerations
- Validate geometry size (reject polygons exceeding bounding region or excessive vertices > e.g. 500).
- Rate limit POST endpoints if public.
- Sanitize region inputs (avoid injection in logs/SQL).

---
## 13. Testing Matrix (Minimal)
| Scenario | Expectation |
|----------|-------------|
| Daily rainfall raster + timeseries | Both succeed; legend shown |
| SPI July 2005 timeseries | Timeseries returns array; no raster call occurs |
| Switch from monthly rainfall to SPI | Legend cleared; month picker remains valid |
| CDD anomaly attempt | No `anomaly` param sent after UI suppression |
| Invalid region | 400/404 graceful error |
| Geometry + large polygon | Either aggregated result or 400 size-error |
| Missing legend in raster | Frontend fails silently (should not happen) |

---
## 14. Sample Requests & Responses
### 14.1 Daily Rainfall Raster (Anomaly)
Request:
```
POST /rainfall/daily/raster-image
{
  "params": {"year":"2024","month":"07","day":"15","anomaly":true,"region":"Tigray"}
}
```
Response:
```
200
{
  "image": "https://cdn.example.com/rainfall/daily/2024/07/15_tigray_anom.png",
  "bounds": [[3.0,32.9],[14.5,48.2]],
  "legend": {"min": -12.5, "max": 18.2, "unit": "mm"}
}
```

### 14.2 SPI Timeseries (July Focus)
Request:
```
POST /drought/spi/timeseries
{
  "params": {"start_year":"1995","end_year":"2024","month":"07","region":"Tigray"}
}
```
Response:
```
200
{
  "data": [-0.2, 0.1, 1.2, -1.0, 0.5],
  "period": [1995, 1999]
}
```

### 14.3 CDD Raster
Request:
```
POST /drought/cdd/raster-image
{
  "params": {"year":"2024","month":"07","day":"15","region":"Tigray"}
}
```
Response:
```
200
{
  "image": "https://cdn.example.com/drought/cdd/2024/07/15_tigray.png",
  "bounds": [[3.0,32.9],[14.5,48.2]],
  "legend": {"min": 0, "max": 23, "unit": "days"}
}
```

### 14.4 Seasonal Temperature Timeseries (JJAS)
Request:
```
POST /temperature/seasonal/timeseries
{
  "params": {"start_year":"2000","end_year":"2024","season":"JJAS","region":"Oromia"}
}
```
Response:
```
200
{
  "data": [21.3, 21.5, 22.0, 21.6],
  "period": [2000, 2003]
}
```

### 14.5 Annual Rainfall Timeseries (Geometry)
Request:
```
POST /rainfall/annual/timeseries
{
  "params": {"start_year":"1990","end_year":"1994"},
  "geometry": {"type":"Polygon","coordinates":[[[40,9],[40.5,9],[40.5,9.5],[40,9.5],[40,9]]]} }
```
Response:
```
200
{
  "data": [820.4, 790.2, 865.0, null, 910.7],
  "period": [1990, 1994]
}
```

---
## 15. Frontend Assumptions Backend MUST Honor
1. Parameter names EXACTLY as listed (e.g., `start_year`, not `startYear`).
2. `region` appears inside `params` object.
3. `geometry` is top-level key (can be absent).
4. Timeseries arrays align exactly with the inclusive year span.
5. Null `data` entries allowed and must not shift indexing.
6. Legend always accompanies raster response except excluded subcategories.
7. SPI/SPEI have no raster endpoint calls (backend may still implement but frontend won’t invoke).
8. Anomaly not requested for CDD/CWD.

---
## 16. Future Extension Hooks
| Area | Suggestion |
|------|------------|
| Climatology | Add endpoint returning multi-month baseline arrays |
| Multiple Indices | Accept `index` param to unify drought endpoints |
| Pagination | Not needed; datasets small (annual series) |
| Units Metadata | Provide `/meta/units` for consistency |
| Health Check | `/health` returning {"status":"ok"} |

---
## 17. Glossary
| Term | Meaning |
|------|---------|
| CDD | Longest run of consecutive dry days (below threshold, e.g., <1 mm) within period |
| CWD | Longest run of consecutive wet days (>= threshold) |
| SPI | Standardized (z-score) precipitation anomaly over accumulation window (currently implicit 1‑month) |
| SPEI | SPI adjusted for potential evapotranspiration |
| Anomaly | Value – climatological baseline (recommend 1991–2020) |
| Climatology | Typical/mean cycle across years |

---
## 18. Quick Validation Checklist (Backend Dev)
- [ ] All endpoints respond with correct CORS headers
- [ ] JSON content-type for non-image endpoints
- [ ] Raster endpoint returns `image`, `bounds`, `legend`
- [ ] Timeseries period length == data length
- [ ] Handles region OR geometry gracefully
- [ ] Returns 400 on malformed params
- [ ] Returns 404 on no data
- [ ] SPI/SPEI timeseries accept `month`
- [ ] CDD/CWD require `month` + `day`
- [ ] Legend units consistent and numeric min/max valid

---
## 19. Contact & Handoff Notes
Provide this spec to the backend team along with:
- List of required region names (Tigray, Amhara, etc.)
- Desired baseline period for anomalies
- Accepted drought thresholds (e.g., dry day < 1 mm, wet day ≥ 1 mm)

If backend deviates (e.g., require region IDs instead of names), frontend must be updated in:
- `RasterOverlay.tsx`
- `ClimateChart.tsx`

---
## 20. Changelog (Spec)
| Date | Change |
|------|--------|
| 2025-10-06 | Initial comprehensive spec created |

---
End of document.
