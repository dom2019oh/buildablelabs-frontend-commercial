import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VID_KEY      = 'bl_vid';   // visitor ID (localStorage — persists)
const SID_KEY      = 'bl_sid';   // session ID (sessionStorage — per tab)
const GEO_KEY      = 'bl_geo';   // cached country (sessionStorage)
const PREV_ID_KEY  = 'bl_prev_id';
const PREV_TS_KEY  = 'bl_prev_ts';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const tracked  = useRef(new Set<string>());

  useEffect(() => {
    // Never track the stakeholder dashboard itself
    if (location.pathname.startsWith('/stakeholder')) return;

    const run = async () => {
      const now = Date.now();

      // Visitor ID (persistent — identifies returning visitors)
      let visitorId = localStorage.getItem(VID_KEY);
      if (!visitorId) { visitorId = uid(); localStorage.setItem(VID_KEY, visitorId); }

      // Session ID (per tab — defines one "session")
      let sessionId = sessionStorage.getItem(SID_KEY);
      if (!sessionId) { sessionId = uid(); sessionStorage.setItem(SID_KEY, sessionId); }

      // Update previous page's duration
      const prevId = sessionStorage.getItem(PREV_ID_KEY);
      const prevTs = sessionStorage.getItem(PREV_TS_KEY);
      if (prevId && prevTs) {
        const secs = Math.round((now - parseInt(prevTs)) / 1000);
        updateDoc(doc(db, 'pageViews', prevId), { duration: secs }).catch(() => {});
      }

      // Avoid double-tracking same path in same session
      const key = `${sessionId}:${location.pathname}`;
      if (tracked.current.has(key)) return;
      tracked.current.add(key);

      // Country (cached for session — one IP lookup per tab)
      let geo = sessionStorage.getItem(GEO_KEY);
      if (!geo) {
        try {
          const r = await fetch('https://ipapi.co/json/');
          const d = await r.json();
          geo = JSON.stringify({ country: d.country_name || 'Unknown', code: d.country_code || '' });
        } catch {
          geo = JSON.stringify({ country: 'Unknown', code: '' });
        }
        sessionStorage.setItem(GEO_KEY, geo);
      }
      const { country, code: countryCode } = JSON.parse(geo);

      try {
        const ref = await addDoc(collection(db, 'pageViews'), {
          visitorId,
          sessionId,
          path:      location.pathname,
          country,
          countryCode,
          referrer:  document.referrer || '',
          uid:       null,
          duration:  null,
          timestamp: serverTimestamp(),
        });
        sessionStorage.setItem(PREV_ID_KEY, ref.id);
        sessionStorage.setItem(PREV_TS_KEY, String(now));
      } catch { /* silently fail */ }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Final duration update when tab closes
  useEffect(() => {
    const onUnload = () => {
      const prevId = sessionStorage.getItem(PREV_ID_KEY);
      const prevTs = sessionStorage.getItem(PREV_TS_KEY);
      if (!prevId || !prevTs) return;
      const secs = Math.round((Date.now() - parseInt(prevTs)) / 1000);
      // Use sendBeacon so it fires reliably on close
      const body = JSON.stringify({ duration: secs });
      navigator.sendBeacon?.(`/api/analytics/duration?id=${prevId}`, body);
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return null;
}
