/**
 * Blueground HTML5 Banner – main.js
 * Shared logic: CSV load, row selection, data binding.
 * Reusable across sizes (300x250, 336x280, 728x90); only CSS and
 * optionally container class change per size.
 */

(function () {
  'use strict';

  var CONFIG = {
    csvPath: 'feed.csv',
    defaultCta: 'Book now!',
    defaultLogo: 'logo.svg'
  };

  /**
   * Map feed columns to banner fields.
   * Supports both ideal names (city, property_name, ...) and actual feed
   * columns (Destination name, Property name, Formatted price, Image URL, ...).
   */
  function mapRow(row) {
    return {
      city: row.city || row['Destination name'] || '',
      neighborhood: row.neighborhood || '',
      property_name: row.property_name || row['Property name'] || '',
      nightly_price: row.nightly_price || row['Formatted price'] || row.Price || '',
      usp_1: row.usp_1 || '',
      usp_2: row.usp_2 || '',
      description: row.Description || [row.usp_1, row.usp_2].filter(Boolean).join(' • ') || '',
      cta_label: row.cta_label || CONFIG.defaultCta,
      image_url: row.image_url || row['Image URL'] || '',
      logo_url: row.logo_url || CONFIG.defaultLogo,
      final_url: row.final_url || row['Final URL'] || 'https://www.theblueground.com/'
    };
  }

  /**
   * Simple CSV parse (handles quoted fields).
   */
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
   */
  function bindData(item) {
    var clickEl = document.getElementById('click-area');
    var heroEl = document.getElementById('hero-image');
    var logoEl = document.getElementById('logo');
    var cityTag = document.getElementById('city-tag');
    var specsEl = document.getElementById('property-specs');
    var nameEl = document.getElementById('property-name');
    var priceEl = document.getElementById('price');
    var ctaEl = document.getElementById('cta');

    if (!item) return;

    if (clickEl) clickEl.href = item.final_url || 'https://www.theblueground.com/';
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
      var img = new Image();
      img.onload = function () {
        heroEl.src = item.image_url;
        heroEl.classList.add('is-loaded');
      };
      img.onerror = function () {
        heroEl.classList.add('is-loaded');
      };
      img.src = item.image_url;
    }
  }

  /**
   * Load CSV, select row, bind. Entry point.
   */
  function init() {
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
