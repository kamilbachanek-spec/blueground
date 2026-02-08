(function () {
  'use strict';

  var DEFAULT_ROW_INDEX = 0;

  function getRowIndex() {
    var params = new URLSearchParams(window.location.search);
    var idx = parseInt(params.get('rowIndex'), 10);
    return isNaN(idx) ? DEFAULT_ROW_INDEX : idx;
  }

  function parseCsv(text) {
    var lines = text.trim().split('\n');
    var headers = lines[0].split(',');
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var values = lines[i].split(',');
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = (values[j] || '').trim();
      }
      rows.push(row);
    }
    return rows;
  }

  function render(data) {
    var cityEl = document.getElementById('city');
    var titleEl = document.getElementById('title');
    var priceEl = document.getElementById('price');
    var bannerEl = document.getElementById('banner');

    if (cityEl) cityEl.textContent = data.city;
    if (titleEl) titleEl.textContent = data.title;
    if (priceEl) priceEl.textContent = 'From $' + data.price + '/mo';

    if (bannerEl) {
      bannerEl.classList.add('visible');
    }
  }

  function init() {
    var rowIndex = getRowIndex();

    fetch('feed.csv')
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load feed.csv');
        return response.text();
      })
      .then(function (text) {
        var rows = parseCsv(text);
        var idx = Math.min(rowIndex, rows.length - 1);
        if (rows.length === 0) throw new Error('No data in feed.csv');
        render(rows[idx]);
      })
      .catch(function (err) {
        console.error('Banner error:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
