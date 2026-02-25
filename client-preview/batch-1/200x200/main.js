/**
 * Blueground HTML5 Banner – main.js
 * Shared logic: CSV load, row selection, data binding.
 * Links to Blueground neighborhood/city listing pages (not individual apartments).
 * Reusable across sizes (300x250, 336x280, 728x90, etc.); only CSS and
 * optionally container class change per size.
 */

(function () {
  'use strict';

  var CONFIG = {
    csvPath: 'feed.csv',
    defaultCta: 'Book now!',
    defaultLogo: 'logo.svg',
    defaultUrl: 'https://www.theblueground.com/'
  };

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
     ============================================================ */

  var NYC_ZONES = [
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
    { name: 'dumbo',             label: 'DUMBO',              type: 's', latMin: 40.700, latMax: 40.706, lngMin: -73.995, lngMax: -73.980 },
    { name: 'brooklyn-heights',  label: 'Brooklyn Heights',   type: 's', latMin: 40.686, latMax: 40.700, lngMin: -74.002, lngMax: -73.985 },
    { name: 'williamsburg',      label: 'Williamsburg',       type: 's', latMin: 40.706, latMax: 40.724, lngMin: -73.966, lngMax: -73.935 },
    { name: 'park-slope',        label: 'Park Slope',         type: 's', latMin: 40.665, latMax: 40.686, lngMin: -73.990, lngMax: -73.968 },
    { name: 'bushwick',          label: 'Bushwick',           type: 's', latMin: 40.686, latMax: 40.706, lngMin: -73.935, lngMax: -73.905 },
    { name: 'manhattan',         label: 'Manhattan',          type: 'a', latMin: 40.700, latMax: 40.880, lngMin: -74.020, lngMax: -73.930 },
    { name: 'brooklyn',          label: 'Brooklyn',           type: 'a', latMin: 40.570, latMax: 40.740, lngMin: -74.050, lngMax: -73.830 },
    { name: 'queens',            label: 'Queens',             type: 'a', latMin: 40.680, latMax: 40.800, lngMin: -73.930, lngMax: -73.700 }
  ];

  var LONDON_ZONES = [
    { name: 'shoreditch',     label: 'Shoreditch',     type: 's', latMin: 51.520, latMax: 51.534, lngMin: -0.085, lngMax: -0.070 },
    { name: 'soho',           label: 'Soho',           type: 's', latMin: 51.510, latMax: 51.518, lngMin: -0.142, lngMax: -0.126 },
    { name: 'covent-garden',  label: 'Covent Garden',  type: 's', latMin: 51.509, latMax: 51.516, lngMin: -0.128, lngMax: -0.116 },
    { name: 'mayfair',        label: 'Mayfair',        type: 's', latMin: 51.505, latMax: 51.517, lngMin: -0.160, lngMax: -0.140 },
    { name: 'marylebone',     label: 'Marylebone',     type: 's', latMin: 51.515, latMax: 51.527, lngMin: -0.165, lngMax: -0.142 },
    { name: 'fitzrovia',      label: 'Fitzrovia',      type: 's', latMin: 51.518, latMax: 51.525, lngMin: -0.142, lngMax: -0.128 },
    { name: 'camden',         label: 'Camden',         type: 's', latMin: 51.535, latMax: 51.555, lngMin: -0.150, lngMax: -0.125 },
    { name: 'islington',      label: 'Islington',      type: 's', latMin: 51.530, latMax: 51.548, lngMin: -0.115, lngMax: -0.090 },
    { name: 'kensington',     label: 'Kensington',     type: 's', latMin: 51.492, latMax: 51.510, lngMin: -0.210, lngMax: -0.175 },
    { name: 'notting-hill',   label: 'Notting Hill',   type: 's', latMin: 51.509, latMax: 51.520, lngMin: -0.210, lngMax: -0.190 },
    { name: 'bayswater',      label: 'Bayswater',      type: 's', latMin: 51.509, latMax: 51.520, lngMin: -0.190, lngMax: -0.170 },
    { name: 'fulham',         label: 'Fulham',         type: 's', latMin: 51.465, latMax: 51.488, lngMin: -0.220, lngMax: -0.185 },
    { name: 'canary-wharf',   label: 'Canary Wharf',   type: 's', latMin: 51.498, latMax: 51.510, lngMin: -0.025, lngMax: -0.005 },
    { name: 'bermondsey',     label: 'Bermondsey',     type: 's', latMin: 51.492, latMax: 51.505, lngMin: -0.085, lngMax: -0.055 },
    { name: 'south-bank',     label: 'South Bank',     type: 's', latMin: 51.498, latMax: 51.508, lngMin: -0.125, lngMax: -0.095 }
  ];

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

  /* ============================================================
     URL BUILDING HELPERS
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

  function extractCountryFromAddress(address) {
    if (!address) return null;
    var parts = address.split(',');
    if (parts.length < 3) return null;
    return parts[parts.length - 3].trim();
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function getNeighborhoodInfo(row) {
    var city = (row['Destination name'] || '').trim();
    var address = row['Address'] || '';
    var finalUrl = row['Final URL'] || '';
    var citySlug = CITY_SLUGS[city] || null;
    var coords = parseCoordinates(address);
    var zone = null;

    if (city === 'New York') zone = detectZone(coords, NYC_ZONES);
    else if (city === 'London') zone = detectZone(coords, LONDON_ZONES);

    if (zone && citySlug) {
      return { label: zone.label, slug: zone.name, type: zone.type, citySlug: citySlug, fallbackUrl: null };
    }
    if (citySlug) {
      return { label: city, slug: null, type: null, citySlug: citySlug, fallbackUrl: null };
    }

    var country = extractCountryFromAddress(address);
    var countryCode = country ? (COUNTRY_CODES[country] || slugify(country)) : null;
    var derivedSlug = (city && countryCode) ? slugify(city) + '-' + countryCode : null;

    return {
      label: city || 'Apartments',
      slug: null, type: null, citySlug: null,
      derivedCitySlug: derivedSlug,
      fallbackUrl: finalUrl || null
    };
  }

  function buildListingUrl(info) {
    if (!info) return CONFIG.defaultUrl;
    if (info.citySlug) {
      var base = 'https://www.theblueground.com/furnished-apartments-' + info.citySlug;
      if (info.slug && info.type === 'a') return base + '/a/' + info.slug;
      if (info.slug && info.type === 's') return base + '/s/' + info.slug;
      return base;
    }
    if (info.derivedCitySlug) {
      return 'https://www.theblueground.com/m/furnished-apartments/' + info.derivedCitySlug;
    }
    if (info.fallbackUrl) return info.fallbackUrl;
    return CONFIG.defaultUrl;
  }

  /* ============================================================
     WRAPPER HEIGHT SYNC – sizes the name-wrapper to its tallest child
     ============================================================ */
  function measureHeight(el) {
    if (!el) return 0;
    var prevPos = el.style.position;
    var prevVis = el.style.visibility;
    var prevOp = el.style.opacity;
    el.style.position = 'relative';
    el.style.visibility = 'hidden';
    el.style.opacity = '0';
    var h = el.scrollHeight;
    el.style.position = prevPos;
    el.style.visibility = prevVis;
    el.style.opacity = prevOp;
    return h;
  }

  function syncWrapperHeight() {
    var wrapper = document.querySelector('.banner__name-wrapper');
    var introEl = document.getElementById('intro-message');
    var nameEl = document.getElementById('property-name');
    if (!wrapper) return;
    var introH = measureHeight(introEl);
    var nameH = measureHeight(nameEl);
    wrapper.style.height = introH + 'px';
    setTimeout(function () {
      wrapper.style.height = nameH + 'px';
    }, 4300);
  }

  /* ============================================================
     MAP & BIND
     ============================================================ */

  /**
   * Map feed columns to banner fields.
   * listing_url is resolved via coordinate-based neighborhood detection.
   */
  function mapRow(row) {
    var info = getNeighborhoodInfo(row);
    return {
      city: row.city || row['Destination name'] || '',
      property_name: row.property_name || row['Property name'] || '',
      nightly_price: row.nightly_price || row['Formatted price'] || row.Price || '',
      description: row.Description || [row.usp_1, row.usp_2].filter(Boolean).join(' • ') || '',
      cta_label: row.cta_label || CONFIG.defaultCta,
      image_url: row.image_url || row['Image URL'] || '',
      logo_url: row.logo_url || CONFIG.defaultLogo,
      listing_url: buildListingUrl(info)
    };
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

    if (!headers.length) {
      var first = lines[0];
      if (first) headers = parseCSVLine(first);
      start = 1;
    }

    for (var j = start; j < lines.length; j++) {
      var raw = lines[j];
      if (!raw || raw.trim() === '') continue;
      var row = parseCSVLine(raw);
      if (row.length < 2) continue;
      var obj = {};
      for (var k = 0; k < headers.length; k++) {
        var val = row[k];
        obj[headers[k]] = (val && val.replace ? val.replace(/^"|"$/g, '').trim() : (val || ''));
      }
      if (obj['Image URL'] || obj.image_url) rows.push(obj);
    }
    return rows;
  }

  function parseCSVLine(line) {
    var out = [];
    var cur = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else if (c !== '\n' && c !== '\r') {
        cur += c;
      }
    }
    out.push(cur.trim());
    return out;
  }

  /**
   * Row selection: random one from the list (or round-robin via sessionStorage).
   */
  function selectRow(rows) {
    if (!rows || rows.length === 0) return null;
    if (rows.length === 1) return rows[0];
    try {
      var key = 'blueground_banner_index';
      var idx = parseInt(sessionStorage.getItem(key) || '0', 10);
      var row = rows[idx % rows.length];
      sessionStorage.setItem(key, String(idx + 1));
      return row;
    } catch (e) {
      return rows[Math.floor(Math.random() * rows.length)];
    }
  }

  /**
   * Bind one mapped item to the DOM.
   * Uses listing_url (neighborhood/city page) instead of final_url (individual apt).
   */
  function bindData(item) {
    var heroEl = document.getElementById('hero-image');
    var logoEl = document.getElementById('logo');
    var cityTag = document.getElementById('city-tag');
    var specsEl = document.getElementById('property-specs');
    var nameEl = document.getElementById('property-name');
    var priceEl = document.getElementById('price');
    var ctaEl = document.getElementById('cta');

    if (!item) {
      clickTag = CONFIG.defaultUrl;
      if (logoEl) {
        logoEl.src = CONFIG.defaultLogo;
        logoEl.alt = 'Blueground';
      }
      if (ctaEl) ctaEl.textContent = CONFIG.defaultCta;
      return;
    }

    clickTag = item.listing_url || CONFIG.defaultUrl;
    if (cityTag) cityTag.textContent = item.city || '';
    if (nameEl) nameEl.textContent = item.property_name || '';
    if (specsEl) specsEl.textContent = item.description || '';
    if (priceEl) priceEl.textContent = item.nightly_price || '';
    if (ctaEl) ctaEl.textContent = item.cta_label || CONFIG.defaultCta;

    if (logoEl) {
      logoEl.src = item.logo_url || CONFIG.defaultLogo;
      logoEl.alt = 'Blueground';
    }

    if (heroEl && item.image_url) {
      heroEl.alt = item.property_name ? item.property_name + ' – Blueground' : 'Blueground property';
      heroEl.src = item.image_url;
    }

    syncWrapperHeight();
  }

  /**
   * Load CSV, select row, bind. Entry point.
   */
  function init() {
    var clickArea = document.getElementById('click-area');
    if (clickArea) {
      clickArea.addEventListener('click', function (e) {
        e.preventDefault();
        window.open(clickTag, '_blank');
      });
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', CONFIG.csvPath, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var rows = [];
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        rows = parseCSV(xhr.responseText);
      }
      var selected = selectRow(rows);
      var item = selected ? mapRow(selected) : null;
      if (!item && rows.length > 0) {
        item = mapRow(rows[0]);
      }
      bindData(item);
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
