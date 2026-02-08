import { useState } from 'react';

interface UrlInputProps {
  onLoadPage: (url: string) => void;
}

export default function UrlInput({ onLoadPage }: UrlInputProps) {
  const [url, setUrl] = useState('https://www.theblueground.com');

  const handleLoad = () => {
    let normalizedUrl = url.trim();
    if (!normalizedUrl) return;
    // Prepend https:// if no protocol
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    // Basic URL validation
    try {
      new URL(normalizedUrl);
    } catch {
      alert('Please enter a valid URL.');
      return;
    }
    setUrl(normalizedUrl);
    onLoadPage(normalizedUrl);
  };

  return (
    <div className="control-group">
      <label htmlFor="url-input">Blueground URL</label>
      <div className="url-row">
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
          placeholder="https://www.theblueground.com/..."
        />
        <button onClick={handleLoad}>Load Page</button>
      </div>
    </div>
  );
}
