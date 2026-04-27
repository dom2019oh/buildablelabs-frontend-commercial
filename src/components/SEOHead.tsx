import { useEffect } from 'react';

interface Props {
  title: string;
  description: string;
  jsonLd?: object[];
  canonical?: string;
}

export default function SEOHead({ title, description, jsonLd, canonical }: Props) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') ?? '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OG tags
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const prevOgTitle = ogTitle?.getAttribute('content') ?? '';
    ogTitle?.setAttribute('content', title);

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const prevOgDesc = ogDesc?.getAttribute('content') ?? '';
    ogDesc?.setAttribute('content', description);

    // Canonical
    let canonicalEl: HTMLLinkElement | null = null;
    if (canonical) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      canonicalEl.href = canonical;
      document.head.appendChild(canonicalEl);
    }

    // JSON-LD scripts
    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      for (const data of jsonLd) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(data);
        document.head.appendChild(s);
        scripts.push(s);
      }
    }

    return () => {
      document.title = prev;
      metaDesc?.setAttribute('content', prevDesc);
      ogTitle?.setAttribute('content', prevOgTitle);
      ogDesc?.setAttribute('content', prevOgDesc);
      scripts.forEach(s => s.parentNode?.removeChild(s));
      canonicalEl?.parentNode?.removeChild(canonicalEl);
    };
  }, [title, description, canonical]);

  return null;
}
