## Ethiopia Climate Dashboard – API Contract

This document defines the official API contract for the Ethiopia Climate Dashboard. The backend is expected to implement these endpoints and structures to ensure compatibility with the Next.js frontend.

---

### Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [POST Body Patterns](#post-body-patterns)
3. [Configuration Endpoint](#configuration-endpoint)
4. [Data Processing Endpoints](#data-processing-endpoints)
   - [Raster Image](#raster-image-endpoint)
   - [Time-Series](#time-series-endpoint)
   - [Climatology](#climatology-endpoint)
5. [Examples](#examples)
   - [Nationwide](#example-nationwide)
   - [Predefined Region](#example-predefined-region)
   - [Custom Geometry](#example-custom-geometry)
6. [Error Handling](#error-handling)
7. [Conventions & Notes](#conventions--notes)

---

## Overview & Architecture

Base URL:
  All paths are relative to the root API base URL (e.g. `https://api.example.org`).

Data Endpoints:
  `raster-image`, `timeseries`, and `climatology` use `POST` to allow optional spatial filters.

Configuration Endpoints:
  Simple cacheable `GET` endpoints (e.g. `/{category}/available-range`).

Spatial Filters:
  Either a predefined `region` (string in `params`) OR a GeoJSON `geometry` (top-level key). 


---

## POST Body Patterns

All data endpoints accept a JSON body with a required `params` object plus optional spatial context.

#### 1. Nationwide (no spatial filter)
The body contains only the `params` object.

```json
{
  "params": { 
    /* temporal + other keys */ 
    }
}
```

#### 2. Predefined region filter (enumerated region name)
The region's name is included as a `region` key inside the `params` object

```json
{
  "params": {
    //...other temporal keys
    "region": "Afar"
  }
}
```

#### 3. Custom geometry (arbitrary polygon / multipolygon)
A geometry object is included as a top-level key, separate from params.

```json
{
  "params": { 
    /* temporal keys */ 
    },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [42.01, 11.10],
        [42.40, 11.10],
        [42.40, 11.35],
        [42.01, 11.35],
        [42.01, 11.10]
      ]
    ]
  }
}
```

> The frontend chooses between `region` and `geometry`; Never both simultaneously.

---

## Configuration Endpoint

### Get Available Date Range
Returns the absolute temporal coverage of the dataset.

Method: GET
Path: `/{category}/available-range`
Query Params: none
Caching Hint: Long-lived / immutable for a given deployment.

Success Response (200 OK):
```json
{
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD"
}
```

---

## Data Processing Endpoints

### Raster Image Endpoint
Generates a base64 PNG overlay plus legend metadata for a single timestep.

Method: POST
Path: `/{category}/{subcategory}/raster-image`
Spatial Filter: choose one of `region` (in params) OR `geometry` (top-level)
Typical Categories: rainfall, temperature, drought (`cdd`, `cwd`)

Request `params` keys:
  - year (string, required) – 4‑digit year
  - month (string, conditional) – 2‑digit month for monthly context
  - day (string, conditional) – 2‑digit day for daily context
  - season (string, conditional) – season code for seasonal context
  - anomaly (boolean, optional) – request anomaly layer if true
  - region (string, optional) – mutually exclusive with top-level geometry

Success (200 OK):
```json
{
  "image": "data:image/png;base64,...",
  "bounds": [[3.0, 33.0], [15.0, 48.0]],
  "legend": { "min": 5.7, "max": 89.2, "unit": "mm" }
}
```

### Time-Series Endpoint
Returns a value per year across a span for a specified sub‑period (e.g. a month, season, or day-of-year snapshot).

Method: POST
Path: `/{category}/{subcategory}/timeseries`
Spatial Filter: `region` OR `geometry`
Use Cases: SPI/SPEI, monthly rainfall, seasonal temperature, etc.

Request `params` keys:
  - start_year (string, required) – inclusive start year
  - end_year (string, required) – inclusive end year
  - month (string, conditional) – month focus for monthly context
  - day (string, conditional) – day focus for daily context
  - season (string, conditional) – season code for seasonal context
  - anomaly (boolean, optional) – anomalies instead of absolute values
  - region (string, optional) – mutually exclusive with geometry

Success (200 OK):
```json
{
  "data": [45.2, 55.1, null, 48.9],
  "period": [2010, 2013]
}
```

### Climatology Endpoint
Returns a single average value across a multi‑year span.

Method: POST
Path: `/{category}/climatology`
Spatial Filter: `region` OR `geometry`

Request `params` keys:
  - start_year (string, required)
  - end_year (string, required)
  - region (string, optional, mutually exclusive with geometry)

Success (200 OK):
```json
{
  "value": 25.5,
  "unit": "°C"
}
```

---

## Examples

### Example: Nationwide
Monthly rainfall raster (no spatial filter)
```http
POST /rainfall/monthly/raster-image
Content-Type: application/json

{
  "params": {
    "year": "2023",
    "month": "07"
  }
}
```

### Example: Predefined Region
Regional monthly temperature anomaly raster
```http
POST /temperature/monthly/raster-image
Content-Type: application/json

{
  "params": {
    "year": "2022",
    "month": "08",
    "anomaly": true,
    "region": "Afar"
  }
}
```

### Example: Custom Geometry
Custom polygon rainfall monthly raster (geometry instead of region)
```http
POST /rainfall/monthly/raster-image
Content-Type: application/json

{
  "params": {
    "year": "2021",
    "month": "09"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [39.50, 8.80],
        [39.70, 8.80],
        [39.70, 8.95],
        [39.50, 8.95],
        [39.50, 8.80]
      ]
    ]
  }
}
```

### Example: Regional SPI Time-Series
```http
POST /drought/spi/timeseries
Content-Type: application/json

{
  "params": {
    "start_year": "2010",
    "end_year": "2020",
    "month": "09",
    "region": "Gambela"
  }
}
```

### Example: Rainfall Climatology (Region)
```http
POST /rainfall/climatology
Content-Type: application/json

{
  "params": {
    "start_year": "2000",
    "end_year": "2010",
    "region": "Somali"
  }
}
```

### Example: Temperature Climatology (Custom Geometry)
```http
POST /temperature/climatology
Content-Type: application/json

{
  "params": {
    "start_year": "1995",
    "end_year": "2005"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [37.10, 12.40],
        [37.45, 12.40],
        [37.45, 12.65],
        [37.10, 12.65],
        [37.10, 12.40]
      ]
    ]
  }
}
```

---

## Error Handling

Status Codes:
  - 400 / 422: Malformed or invalid parameter combination (e.g. invalid season code, start_year > end_year)
  - 404: No data for a valid spatial + temporal selection
  - 500: Unexpected server error or downstream processing failure

Error Response Shape:
```json
{ "detail": "No data available for the specified parameters." }
```

---

## Conventions & Notes
1. All years, months, and days are zero-padded strings (`"08"`, not `8`).
2. `anomaly: true` switches server logic to anomaly retrieval or calculation; omitting it implies absolute values.
3. Legend values are numeric and may be floats; frontend formats to two decimals.
4. If a timestep has no value for a time-series position, return `null` at that index (frontend skips plotting gaps).
5. Never return both `region` and `geometry` echoes in the response—inputs are sufficient for provenance.
6. Future extension fields should be ignored gracefully by the backend to maintain forward compatibility.

