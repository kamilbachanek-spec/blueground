import { useState } from 'react';

export default function UrlInput() {
  const [url, setUrl] = useState('https://www.theblueground.com');

  const handleOpen = () => {
    let normalizedUrl = url.trim();
    if (!normalizedUrl) return;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      alert('Please enter a valid URL.');
      return;
    }
    setUrl(normalizedUrl);
    window.open(normalizedUrl, '_blank');
  };

  return (
    <div className="control-group url-control">
      <label htmlFor="url-input">Blueground Page</label>
      <div className="url-row">
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
          placeholder="https://www.theblueground.com/..."
        />
        <button onClick={handleOpen}>Open in New Tab</button>
      </div>
    </div>
  );
}
