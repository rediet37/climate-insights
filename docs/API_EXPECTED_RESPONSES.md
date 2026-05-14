# Climate Insights — Expected API Response Formats

Updated: 2026-01-08

This file consolidates the **expected response formats** for every backend API request currently made by the `climate-insights` frontend.

Base URL:
- All paths below are relative to `${NEXT_PUBLIC_API_BASE_URL}`.

Conventions:
- All responses are JSON unless otherwise noted.
- All POST endpoints accept a JSON body of the form:
  - `{ "params": { ... }, "geometry"?: GeoJSONGeometry }`
  - Spatial filters:
    - Use `params.region` for ADM1 region name OR `params.woreda` for ADM3 name OR top-level `geometry` for custom areas.
    - Frontend design is “never both region/woreda and geometry”.

GeoJSON geometry:
- The frontend sends a GeoJSON `geometry` object (typically `Polygon` or `MultiPolygon`) under the **top-level** `geometry` key.

---

## 1) GET /{category}/available-range
Used by: timeframe + pickers.

### Success (HTTP 200)
```json
{
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD"
}
```

Notes:
- `start` and `end` must be ISO date strings. The frontend also tolerates year-only strings (e.g. `"2024"`) and normalizes them to full dates.

---

## 2) POST /{category}/{subcategory}/raster-image
Used by: map overlay (NOT called for `subcategory in [climatology, spi, spei]`).

### Success (HTTP 200)
```json
{
  "image": "data:image/png;base64,...",
  "bounds": [[3.0, 32.9], [14.5, 48.2]],
  "legend": {
    "min": 0.12,
    "max": 56.89,
    "unit": "mm"
  }
}
```

Field semantics:
- `image` (string)
  - Either a data URI (e.g. `data:image/png;base64,...`) OR a fully-qualified URL.
- `bounds` (array)
  - Two coordinate pairs in Leaflet LatLngBounds format: `[[southLat, westLng], [northLat, eastLng]]`.
- `legend` (object)
  - `min` and `max` are numbers and must satisfy `min <= max`.
  - `unit` is a short label (examples: `mm`, `°C`, `days`).

---

## 3) POST /{category}/{subcategory}/timeseries
Used by: inter-annual line chart (called for most subcategories when inputs are present).

### Success (HTTP 200)
```json
{
  "data": [12.3, 14.1, null, 18.2],
  "period": [1990, 1993]
}
```

Field semantics:
- `period` is an inclusive year range: `[startYear, endYear]`.
- `data` is aligned to the `period` range.
  - Required invariant: `data.length === (period[1] - period[0] + 1)`.
  - `null` indicates “missing data for this year”.

---

## 4) POST /{category}/climatology
Used by: climatology panel (this endpoint is called by the frontend).

### Success (HTTP 200)
```json
{
  "value": 25.5,
  "unit": "°C"
}
```

Field semantics:
- `value` is the aggregated climatology value for the selected year range (and optional spatial filter).
- `unit` is a short label (examples: `mm`, `°C`).

---

## 5) Error response format (recommended)
The current frontend mostly checks `res.ok` and shows a generic error UI. To standardize backend behavior and enable future richer error handling, return this JSON for non-2xx responses where possible:

```json
{
  "error": {
    "code": 404,
    "message": "No data for given parameters",
    "details": {
      "params": { "...": "..." }
    }
  }
}
```

Notes:
- Prefer using the real HTTP status code (400/404/500) and mirroring it into `error.code`.
- `details` is optional.

---

## Categories and subcategories (frontend)
The frontend constructs URLs as:
- `${BASE_URL}/{category}/available-range`
- `${BASE_URL}/{category}/{subcategory}/raster-image`
- `${BASE_URL}/{category}/{subcategory}/timeseries`
- `${BASE_URL}/{category}/climatology`

Categories:
- `rainfall`
- `temperature`
- `drought`

Subcategories:
- rainfall: `daily`, `monthly`, `seasonal`, `annual`, `climatology`
- temperature: `daily`, `monthly`, `seasonal`, `annual`, `climatology`
- drought: `cdd`, `cwd`, `spi`, `spei`
