/**
 * Blueground Batch 2 – Sophia persona
 * Loads feed, filters preferred city, builds carousel (max 3),
 * dynamic tags/price, and links to Blueground neighborhood listing pages.
 */
(function () {
  'use strict';

  var CONFIG = {
    csvPath: 'feed.csv',
    defaultUrl: 'https://www.theblueground.com/',
    carouselSize: 3,
    carouselIntervalMs: 3500,
    preferredCities: ['London']
  };

  var carouselItems = [];
  var currentSlideIndex = 0;

  /* ============================================================
     CITY SLUG MAP – Destination name → Blueground city URL slug
     ============================================================ */
  var CITY_SLUGS = {
    'New York':       'new-york-usa',
    'London':         'london-uk',
    'Los Angeles':    'los-angeles-usa',
    'Chicago':        'chicago-usa',
    'San Francisco':  'san-francisco-usa',
    'Washington':     'washington-dc-usa',
    'Boston':         'boston-usa',
    'Miami':          'miami-fl',
    'Seattle':        'seattle-usa',
    'Atlanta':        'atlanta-ga',
    'Dallas':         'dallas-tx',
    'Denver':         'denver-usa',
    'Austin':         'austin-tx',
    'Nashville':      'nashville-tn',
    'Dubai':          'dubai-uae',
    'Paris':          'paris-france',
    'Athens':         'athens-greece',
    'Istanbul':       'istanbul-turkey',
    'Vienna':         'vienna-austria'
  };

  /* ============================================================
     COORDINATE-BASED NEIGHBORHOOD / BOROUGH DETECTION
     Each entry: { name, type ('s' = sub-neighborhood, 'a' = area/borough),
                   latMin, latMax, lngMin, lngMax }
     Order matters – more specific (smaller) areas should come first.
     ============================================================ */

  // New York neighborhoods & boroughs
  var NYC_ZONES = [
    // Manhattan neighborhoods (specific → general)
    { name: 'financial-district', label: 'Financial District', type: 's', latMin: 40.700, latMax: 40.714, lngMin: -74.020, lngMax: -73.998 },
    { name: 'tribeca',           label: 'Tribeca',            type: 's', latMin: 40.714, latMax: 40.722, lngMin: -74.013, lngMax: -74.000 },
    { name: 'soho',              label: 'SoHo',               type: 's', latMin: 40.718, latMax: 40.728, lngMin: -74.005, lngMax: -73.993 },
    { name: 'lower-east-side',   label: 'Lower East Side',    type: 's', latMin: 40.714, latMax: 40.724, lngMin: -73.993, lngMax: -73.975 },
    { name: 'west-village',      label: 'West Village',       type: 's', latMin: 40.728, latMax: 40.738, lngMin: -74.008, lngMax: -73.997 },
    { name: 'east-village',      label: 'East Village',       type: 's', latMin: 40.722, latMax: 40.733, lngMin: -73.993, lngMax: -73.978 },
    { name: 'gramercy',          label: 'Gramercy',           type: 's', latMin: 40.733, latMax: 40.742, lngMin: -73.990, lngMax: -73.978 },
    { name: 'chelsea',           label: 'Chelsea',            type: 's', latMin: 40.738, latMax: 40.752, lngMin: -74.003, lngMax: -73.988 },
    { name: 'hells-kitchen',     label: "Hell's Kitchen",     type: 's', latMin: 40.752, latMax: 40.770, lngMin: -74.000, lngMax: -73.988 },
    { name: 'midtown',           label: 'Midtown',            type: 's', latMin: 40.748, latMax: 40.770, lngMin: -73.988, lngMax: -73.968 },
    { name: 'upper-west-side',   label: 'Upper West Side',    type: 's', latMin: 40.770, latMax: 40.802, lngMin: -73.998, lngMax: -73.968 },
    { name: 'upper-east-side',   label: 'Upper East Side',    type: 's', latMin: 40.770, latMax: 40.790, lngMin: -73.968, lngMax: -73.940 },
    { name: 'harlem',            label: 'Harlem',             type: 's', latMin: 40.800, latMax: 40.835, lngMin: -73.965, lngMax: -73.930 },
    // Brooklyn neighborhoods
    { name: 'dumbo',             label: 'DUMBO',              type: 's', latMin: 40.700, latMax: 40.706, lngMin: -73.995, lngMax: -73.980 },
    { name: 'brooklyn-heights',  label: 'Brooklyn Heights',   type: 's', latMin: 40.686, latMax: 40.700, lngMin: -74.002, lngMax: -73.985 },
    { name: 'williamsburg',      label: 'Williamsburg',       type: 's', latMin: 40.706, latMax: 40.724, lngMin: -73.966, lngMax: -73.935 },
    { name: 'park-slope',        label: 'Park Slope',         type: 's', latMin: 40.665, latMax: 40.686, lngMin: -73.990, lngMax: -73.968 },
    { name: 'bushwick',          label: 'Bushwick',           type: 's', latMin: 40.686, latMax: 40.706, lngMin: -73.935, lngMax: -73.905 },
    // Borough-level fallbacks (must be last)
    { name: 'manhattan',         label: 'Manhattan',          type: 'a', latMin: 40.700, latMax: 40.880, lngMin: -74.020, lngMax: -73.930 },
    { name: 'brooklyn',          label: 'Brooklyn',           type: 'a', latMin: 40.570, latMax: 40.740, lngMin: -74.050, lngMax: -73.830 },
    { name: 'queens',            label: 'Queens',             type: 'a', latMin: 40.680, latMax: 40.800, lngMin: -73.930, lngMax: -73.700 }
  ];

  // London neighborhoods (expanded coverage – ~50 zones)
  var LONDON_ZONES = [
    // === CENTRAL LONDON (specific neighborhoods) ===
    { name: 'shoreditch',        label: 'Shoreditch',        type: 's', latMin: 51.518, latMax: 51.536, lngMin: -0.088, lngMax: -0.068 },
    { name: 'soho',              label: 'Soho',              type: 's', latMin: 51.509, latMax: 51.518, lngMin: -0.142, lngMax: -0.126 },
    { name: 'covent-garden',     label: 'Covent Garden',     type: 's', latMin: 51.508, latMax: 51.516, lngMin: -0.128, lngMax: -0.114 },
    { name: 'mayfair',           label: 'Mayfair',           type: 's', latMin: 51.504, latMax: 51.517, lngMin: -0.160, lngMax: -0.140 },
    { name: 'marylebone',        label: 'Marylebone',        type: 's', latMin: 51.514, latMax: 51.528, lngMin: -0.170, lngMax: -0.140 },
    { name: 'fitzrovia',         label: 'Fitzrovia',         type: 's', latMin: 51.517, latMax: 51.526, lngMin: -0.142, lngMax: -0.126 },
    { name: 'bloomsbury',        label: 'Bloomsbury',        type: 's', latMin: 51.518, latMax: 51.530, lngMin: -0.130, lngMax: -0.115 },
    { name: 'holborn',           label: 'Holborn',           type: 's', latMin: 51.513, latMax: 51.522, lngMin: -0.125, lngMax: -0.105 },
    { name: 'clerkenwell',       label: 'Clerkenwell',       type: 's', latMin: 51.520, latMax: 51.532, lngMin: -0.115, lngMax: -0.095 },
    { name: 'city-of-london',    label: 'City of London',    type: 's', latMin: 51.508, latMax: 51.522, lngMin: -0.098, lngMax: -0.068 },
    // === WEST LONDON ===
    { name: 'notting-hill',      label: 'Notting Hill',      type: 's', latMin: 51.507, latMax: 51.522, lngMin: -0.215, lngMax: -0.190 },
    { name: 'bayswater',         label: 'Bayswater',         type: 's', latMin: 51.508, latMax: 51.520, lngMin: -0.192, lngMax: -0.168 },
    { name: 'paddington',        label: 'Paddington',        type: 's', latMin: 51.513, latMax: 51.525, lngMin: -0.192, lngMax: -0.168 },
    { name: 'kensington',        label: 'Kensington',        type: 's', latMin: 51.488, latMax: 51.510, lngMin: -0.215, lngMax: -0.172 },
    { name: 'earls-court',       label: "Earl's Court",      type: 's', latMin: 51.485, latMax: 51.498, lngMin: -0.205, lngMax: -0.185 },
    { name: 'chelsea',           label: 'Chelsea',           type: 's', latMin: 51.480, latMax: 51.498, lngMin: -0.185, lngMax: -0.148 },
    { name: 'fulham',            label: 'Fulham',            type: 's', latMin: 51.460, latMax: 51.492, lngMin: -0.230, lngMax: -0.178 },
    { name: 'hammersmith',       label: 'Hammersmith',       type: 's', latMin: 51.485, latMax: 51.502, lngMin: -0.250, lngMax: -0.215 },
    { name: 'shepherds-bush',    label: "Shepherd's Bush",   type: 's', latMin: 51.498, latMax: 51.515, lngMin: -0.240, lngMax: -0.215 },
    // === NORTH LONDON ===
    { name: 'camden',            label: 'Camden',            type: 's', latMin: 51.533, latMax: 51.558, lngMin: -0.158, lngMax: -0.118 },
    { name: 'hampstead',         label: 'Hampstead',         type: 's', latMin: 51.550, latMax: 51.575, lngMin: -0.195, lngMax: -0.155 },
    { name: 'islington',         label: 'Islington',         type: 's', latMin: 51.528, latMax: 51.550, lngMin: -0.118, lngMax: -0.088 },
    { name: 'dalston',           label: 'Dalston',           type: 's', latMin: 51.543, latMax: 51.558, lngMin: -0.085, lngMax: -0.060 },
    { name: 'hackney',           label: 'Hackney',           type: 's', latMin: 51.534, latMax: 51.558, lngMin: -0.075, lngMax: -0.035 },
    { name: 'stoke-newington',   label: 'Stoke Newington',   type: 's', latMin: 51.555, latMax: 51.572, lngMin: -0.085, lngMax: -0.065 },
    // === EAST LONDON ===
    { name: 'whitechapel',       label: 'Whitechapel',       type: 's', latMin: 51.510, latMax: 51.525, lngMin: -0.070, lngMax: -0.040 },
    { name: 'bethnal-green',     label: 'Bethnal Green',     type: 's', latMin: 51.522, latMax: 51.535, lngMin: -0.068, lngMax: -0.040 },
    { name: 'mile-end',          label: 'Mile End',          type: 's', latMin: 51.518, latMax: 51.532, lngMin: -0.042, lngMax: -0.018 },
    { name: 'bow',               label: 'Bow',               type: 's', latMin: 51.525, latMax: 51.540, lngMin: -0.030, lngMax: -0.003 },
    { name: 'stratford',         label: 'Stratford',         type: 's', latMin: 51.535, latMax: 51.550, lngMin: -0.010, lngMax: 0.015 },
    { name: 'canary-wharf',      label: 'Canary Wharf',      type: 's', latMin: 51.495, latMax: 51.515, lngMin: -0.035, lngMax: 0.002 },
    { name: 'limehouse',         label: 'Limehouse',         type: 's', latMin: 51.508, latMax: 51.518, lngMin: -0.042, lngMax: -0.020 },
    // === SOUTH LONDON ===
    { name: 'south-bank',        label: 'South Bank',        type: 's', latMin: 51.496, latMax: 51.510, lngMin: -0.130, lngMax: -0.088 },
    { name: 'bermondsey',        label: 'Bermondsey',        type: 's', latMin: 51.490, latMax: 51.506, lngMin: -0.090, lngMax: -0.048 },
    { name: 'westminster',       label: 'Westminster',       type: 's', latMin: 51.493, latMax: 51.508, lngMin: -0.150, lngMax: -0.118 },
    { name: 'pimlico',           label: 'Pimlico',           type: 's', latMin: 51.482, latMax: 51.495, lngMin: -0.150, lngMax: -0.125 },
    { name: 'vauxhall',          label: 'Vauxhall',          type: 's', latMin: 51.478, latMax: 51.492, lngMin: -0.128, lngMax: -0.108 },
    { name: 'elephant-castle',   label: 'Elephant & Castle', type: 's', latMin: 51.488, latMax: 51.500, lngMin: -0.105, lngMax: -0.088 },
    { name: 'battersea',         label: 'Battersea',         type: 's', latMin: 51.458, latMax: 51.480, lngMin: -0.190, lngMax: -0.138 },
    { name: 'clapham',           label: 'Clapham',           type: 's', latMin: 51.450, latMax: 51.468, lngMin: -0.155, lngMax: -0.110 },
    { name: 'brixton',           label: 'Brixton',           type: 's', latMin: 51.448, latMax: 51.468, lngMin: -0.120, lngMax: -0.095 },
    { name: 'peckham',           label: 'Peckham',           type: 's', latMin: 51.465, latMax: 51.480, lngMin: -0.080, lngMax: -0.048 },
    { name: 'greenwich',         label: 'Greenwich',         type: 's', latMin: 51.468, latMax: 51.492, lngMin: -0.015, lngMax: 0.025 },
    { name: 'wandsworth',        label: 'Wandsworth',        type: 's', latMin: 51.445, latMax: 51.465, lngMin: -0.210, lngMax: -0.178 },
    { name: 'putney',            label: 'Putney',            type: 's', latMin: 51.448, latMax: 51.468, lngMin: -0.230, lngMax: -0.198 },
    // === BROADER AREA FALLBACKS (must be last – checked after specific zones) ===
    { name: 'central-london',    label: 'Central London',    type: 'a', latMin: 51.495, latMax: 51.535, lngMin: -0.170, lngMax: -0.060 },
    { name: 'west-london',       label: 'West London',       type: 'a', latMin: 51.460, latMax: 51.535, lngMin: -0.260, lngMax: -0.170 },
    { name: 'north-london',      label: 'North London',      type: 'a', latMin: 51.535, latMax: 51.600, lngMin: -0.200, lngMax: 0.000 },
    { name: 'east-london',       label: 'East London',       type: 'a', latMin: 51.490, latMax: 51.560, lngMin: -0.060, lngMax: 0.080 },
    { name: 'south-london',      label: 'South London',      type: 'a', latMin: 51.410, latMax: 51.495, lngMin: -0.200, lngMax: 0.030 }
  ];

  /* ============================================================
     PARSE COORDINATES FROM ADDRESS
     Address format: "Street, City, Country, LAT, LNG"
     ============================================================ */
  function parseCoordinates(address) {
    if (!address) return null;
    var parts = address.split(',');
    if (parts.length < 2) return null;
    var lng = parseFloat(parts[parts.length - 1]);
    var lat = parseFloat(parts[parts.length - 2]);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat: lat, lng: lng };
  }

  /* ============================================================
     DETECT ZONE (NEIGHBORHOOD OR BOROUGH) FROM COORDINATES
     Returns: { name, label, type } or null
     ============================================================ */
  function detectZone(coords, zones) {
    if (!coords || !zones) return null;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (coords.lat >= z.latMin && coords.lat <= z.latMax &&
          coords.lng >= z.lngMin && coords.lng <= z.lngMax) {
        return z;
      }
    }
    return null;
  }

  /* ============================================================
     DERIVE CITY SLUG FROM DESTINATION NAME + ADDRESS
     For cities not in CITY_SLUGS, build a slug from the city name
     and country in the address for the /m/ URL pattern.
     Address format: "Street, City, Country, LAT, LNG"
     ============================================================ */
  var COUNTRY_CODES = {
    'United States': 'usa', 'United States of America': 'usa',
    'United Kingdom': 'uk', 'United Arab Emirates': 'uae',
    'Canada': 'can', 'France': 'fra', 'Germany': 'deu',
    'Spain': 'esp', 'Italy': 'ita', 'Greece': 'grc',
    'Turkey': 'tur', 'Austria': 'aut', 'Netherlands': 'nld',
    'Portugal': 'prt', 'Brazil': 'bra', 'Mexico': 'mex',
    'Australia': 'aus', 'Japan': 'jpn', 'Ireland': 'irl',
    'Belgium': 'bel', 'Switzerland': 'che', 'Sweden': 'swe',
    'Denmark': 'dnk', 'Norway': 'nor', 'Poland': 'pol',
    'Czech Republic': 'cze', 'Hungary': 'hun', 'Romania': 'rou',
    'Croatia': 'hrv', 'Cyprus': 'cyp', 'Malta': 'mlt'
  };

  function extractCountryFromAddress(address) {
    if (!address) return null;
    var parts = address.split(',');
    // Address: "Street, City, Country, LAT, LNG" — country is 3rd from end
    if (parts.length < 3) return null;
    return parts[parts.length - 3].trim();
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ============================================================
     GET NEIGHBORHOOD INFO FOR AN ITEM
     Returns: { label, slug, type, citySlug, fallbackUrl } or fallback
     ============================================================ */
  function getNeighborhoodInfo(item) {
    var city = (item['Destination name'] || '').trim();
    var address = item['Address'] || '';
    var finalUrl = item['Final URL'] || '';
    var citySlug = CITY_SLUGS[city] || null;
    var coords = parseCoordinates(address);
    var zone = null;

    // Pick the right zone list based on city
    if (city === 'New York') {
      zone = detectZone(coords, NYC_ZONES);
    } else if (city === 'London') {
      zone = detectZone(coords, LONDON_ZONES);
    }

    // Best case: detected neighborhood + known city slug
    if (zone && citySlug) {
      return { label: zone.label, slug: zone.name, type: zone.type, citySlug: citySlug, fallbackUrl: null };
    }

    // Known city but no specific neighborhood detected → city page
    if (citySlug) {
      return { label: city, slug: null, type: null, citySlug: citySlug, fallbackUrl: null };
    }

    // Unknown city → try to derive a /m/ URL from city name + country code
    var country = extractCountryFromAddress(address);
    var countryCode = country ? (COUNTRY_CODES[country] || slugify(country)) : null;
    var derivedSlug = null;
    if (city && countryCode) {
      derivedSlug = slugify(city) + '-' + countryCode;
    }

    return {
      label: city || 'Apartments',
      slug: null,
      type: null,
      citySlug: null,
      derivedCitySlug: derivedSlug,   // for /m/ pattern
      fallbackUrl: finalUrl || null    // apartment's own URL as last resort
    };
  }

  /* ============================================================
     BUILD BLUEGROUND LISTING URL
     Priority:
       1. Neighborhood:  /furnished-apartments-{city-slug}/s/{hood-slug}
       2. Borough/Area:  /furnished-apartments-{city-slug}/a/{area-slug}
       3. City page:     /furnished-apartments-{city-slug}
       4. Derived city:  /m/furnished-apartments/{city-country-slug}
       5. Apartment URL: Final URL from the feed (individual listing)
       6. Homepage:      theblueground.com
     ============================================================ */
  function buildListingUrl(info) {
    if (!info) return CONFIG.defaultUrl;

    // Known city with neighborhood or area
    if (info.citySlug) {
      var base = 'https://www.theblueground.com/furnished-apartments-' + info.citySlug;
      if (info.slug && info.type === 'a') return base + '/a/' + info.slug;
      if (info.slug && info.type === 's') return base + '/s/' + info.slug;
      return base;
    }

    // Derived city slug (for cities not in the hardcoded map)
    if (info.derivedCitySlug) {
      return 'https://www.theblueground.com/m/furnished-apartments/' + info.derivedCitySlug;
    }

    // Apartment's own Final URL from the feed
    if (info.fallbackUrl) return info.fallbackUrl;

    return CONFIG.defaultUrl;
  }

  /* ============================================================
     CSV PARSING
     ============================================================ */
  function parseCSV(text) {
    var rows = [];
    var lines = text.split(/\r?\n/);
    var headers = [];
    var start = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf('Item status') !== -1 && line.indexOf('Property ID') !== -1) {
        headers = parseCSVLine(line);
        start = i + 1;
        break;
      }
    }
    if (!headers.length && lines[0]) {
      headers = parseCSVLine(lines[0]);
      start = 1;
    }
    for (var j = start; j < lines.length; j++) {
      var raw = lines[j];
      if (!raw || !raw.trim()) continue;
      var row = parseCSVLine(raw);
      if (row.length < 2) continue;
      var obj = {};
      for (var k = 0; k < headers.length; k++) {
        var val = row[k];
        obj[headers[k]] = (val && val.replace ? val.replace(/^"|"$/g, '').trim() : (val || ''));
      }
      if (obj['Image URL'] && obj['Image URL'].indexOf('http') === 0) rows.push(obj);
    }
    return rows;
  }

  function parseCSVLine(line) {
    var out = [], cur = '', inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; }
      else if (c !== '\n' && c !== '\r') cur += c;
    }
    out.push(cur.trim());
    return out;
  }

  function filterPreferred(rows) {
    var preferred = [];
    for (var i = 0; i < rows.length; i++) {
      var city = (rows[i]['Destination name'] || '').trim();
      if (CONFIG.preferredCities.indexOf(city) !== -1) preferred.push(rows[i]);
    }
    return preferred.length ? preferred : rows;
  }

  function selectCarouselRows(rows) {
    var pool = filterPreferred(rows);
    if (!pool.length) return [];
    var size = Math.min(CONFIG.carouselSize, pool.length);
    var indices = [];
    for (var i = 0; i < pool.length; i++) indices.push(i);
    for (var j = indices.length - 1; j > 0; j--) {
      var r = Math.floor(Math.random() * (j + 1));
      var t = indices[j]; indices[j] = indices[r]; indices[r] = t;
    }
    var out = [];
    for (var k = 0; k < size; k++) out.push(pool[indices[k]]);
    return out;
  }

  /* ============================================================
     DYNAMIC UI UPDATES
     ============================================================ */
  function updateTags(items) {
    var tagsEl = document.getElementById('tags');
    if (!tagsEl || !items || !items.length) return;
    var labels = [];
    for (var i = 0; i < items.length; i++) {
      var info = getNeighborhoodInfo(items[i]);
      var lbl = info.label;
      if (lbl && labels.indexOf(lbl) === -1) labels.push(lbl);
    }
    if (labels.length === 0) labels = [CONFIG.preferredCities[0] || 'Apartments'];
    tagsEl.innerHTML = '';
    for (var j = 0; j < labels.length; j++) {
      var tag = document.createElement('span');
      tag.className = 'banner__tag';
      tag.textContent = labels[j];
      tagsEl.appendChild(tag);
    }
  }

  function updatePrice(item) {
    var priceEl = document.getElementById('price');
    if (priceEl && item && item['Formatted price']) {
      var newText = 'From ' + item['Formatted price'] + '/month';
      if (priceEl.textContent === newText) return;
      priceEl.style.opacity = '0';
      setTimeout(function () {
        priceEl.textContent = newText;
        priceEl.style.opacity = '1';
      }, 250);
    }
  }

  function updateClickUrl(item) {
    if (!item) return;
    var info = getNeighborhoodInfo(item);
    clickTag = buildListingUrl(info);
  }

  /* ============================================================
     CAROUSEL
     ============================================================ */
  function buildCarousel(items) {
    var container = document.getElementById('carousel');
    if (!container) return;
    container.innerHTML = '';
    if (!items || !items.length) return;
    carouselItems = items;
    currentSlideIndex = 0;
    updateTags(items);
    updatePrice(items[0]);
    updateClickUrl(items[0]);
    for (var i = 0; i < items.length; i++) {
      var slide = document.createElement('div');
      slide.className = 'banner__carousel-slide' + (i === 0 ? ' banner__carousel-slide--active' : '');
      slide.setAttribute('data-index', i);
      var img = document.createElement('img');
      img.src = items[i]['Image URL'] || '';
      img.alt = items[i]['Property name'] ? items[i]['Property name'] + ' – Blueground' : 'Blueground';
      img.referrerPolicy = 'no-referrer';
      slide.appendChild(img);
      container.appendChild(slide);
    }
  }

  function runCarousel() {
    var intervalId = setInterval(function () {
      var slides = document.querySelectorAll('.banner__carousel-slide');
      if (slides.length <= 1) return;
      if (slides[currentSlideIndex]) {
        slides[currentSlideIndex].classList.remove('banner__carousel-slide--active');
      }
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      if (slides[currentSlideIndex]) {
        slides[currentSlideIndex].classList.add('banner__carousel-slide--active');
      }
      if (carouselItems && carouselItems[currentSlideIndex]) {
        updatePrice(carouselItems[currentSlideIndex]);
        updateClickUrl(carouselItems[currentSlideIndex]);
      }
    }, CONFIG.carouselIntervalMs);
    // Google Ads: stop all animation after 30 seconds
    setTimeout(function () { clearInterval(intervalId); }, 30000);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', CONFIG.csvPath, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var rows = [];
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) rows = parseCSV(xhr.responseText);
      var carouselRows = selectCarouselRows(rows);
      buildCarousel(carouselRows);
      runCarousel();
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
