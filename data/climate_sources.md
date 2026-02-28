# Baseline Climate & Geospatial Data Sources

## Hourly Weather Data
| Source | Coverage | Resolution | Access |
|---|---|---|---|
| [ERA5 Reanalysis](https://cds.climate.copernicus.eu/) | Global, 1940–present | 31 km, hourly | Free (CDS API) |
| [TMY / EPW files](https://climate.onebuilding.org/) | ~3,500 stations worldwide | Hourly typical year | Free download |
| [IMD Station Data](https://www.imd.gov.in/) | India only | 3-hourly / daily | Restricted; request-based |

## Solar Radiation
| Source | Coverage | Access |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) | Global | Free REST API |
| [pvlib (Python)](https://pvlib-python.readthedocs.io/) | Computed from lat/lon + date | Open-source library |

## Wind Data
| Source | Coverage | Access |
|---|---|---|
| ERA5 10m wind components | Global, hourly | Free (CDS API) |
| [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu/ASOS/) | Global ASOS stations | Free |

## Topography & Landcover
| Source | Resolution | Access |
|---|---|---|
| [SRTM DEM](https://earthexplorer.usgs.gov/) | 30 m | Free |
| [OpenStreetMap](https://www.openstreetmap.org/) | Vector | Free |
| [Copernicus Land Cover](https://land.copernicus.eu/) | 100 m global | Free |

## Material Property Databases
| Source | Content |
|---|---|
| BIS IS 3792 / IS 1077 | Indian brick & block standards |
| ASHRAE Fundamentals Ch. 26 | Thermal properties of building materials |
| ICE Database (Bath, UK) | Embodied carbon of construction materials |

## Notes
- For the MVP, **ERA5 + NASA POWER + pvlib** provide sufficient coverage for all pilot sites.
- IMD data can supplement ERA5 for Indian stations where available.
- Material properties will be manually curated and seeded initially.
