(function () {
  var params = new URLSearchParams(window.location.search);
  var rowIndex = parseInt(params.get('rowIndex') || '0', 10);

  fetch('feed.csv')
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text);
      var row = rows[rowIndex] || rows[0];
      if (!row) return;

      document.getElementById('city').textContent = row['Destination name'] || '';
      document.getElementById('propertyName').textContent = row['Property name'] || '';
      document.getElementById('price').textContent = row['Formatted price'] || '';

      var cta = document.getElementById('cta');
      if (row['URL']) cta.href = row['URL'];

      var bgImage = document.getElementById('bgImage');
      if (row['Image URL']) {
        bgImage.style.backgroundImage = 'url(' + row['Image URL'] + ')';
      }

      // Click-through on whole banner
      document.getElementById('banner').addEventListener('click', function (e) {
        if (e.target.tagName !== 'A') {
          window.open(row['URL'] || '#', '_blank');
        }
      });
    })
    .catch(function (err) {
      console.error('Banner: failed to load feed.csv', err);
    });

  function parseCsv(text) {
    var lines = text.split(/\r?\n/);
    var headerLine = -1;
    var headers = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('Property name') !== -1 || lines[i].indexOf('property_name') !== -1) {
        headers = parseLine(lines[i]);
        headerLine = i;
        break;
      }
    }
    if (headerLine === -1 && lines.length > 0) {
      headers = parseLine(lines[0]);
      headerLine = 0;
    }
    var result = [];
    for (var j = headerLine + 1; j < lines.length; j++) {
      var line = lines[j].trim();
      if (!line) continue;
      var values = parseLine(line);
      var obj = {};
      for (var k = 0; k < headers.length; k++) {
        obj[headers[k]] = values[k] || '';
      }
      result.push(obj);
    }
    return result;
  }

  function parseLine(line) {
    var out = [];
    var cur = '';
    var inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQ = false; }
        else { cur += ch; }
      } else {
        if (ch === '"') { inQ = true; }
        else if (ch === ',') { out.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
    }
    out.push(cur.trim());
    return out;
  }
})();
