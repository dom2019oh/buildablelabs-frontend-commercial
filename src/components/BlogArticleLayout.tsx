import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import FloatingNav from '@/components/FloatingNav';
import { AmbientBg } from '@/lib/glass';

interface Props {
  children: ReactNode;
}

export default function BlogArticleLayout({ children }: Props) {
  return (
    <div style={{ background: '#06060b', minHeight: '100vh', position: 'relative' }}>
      <AmbientBg />
      <FloatingNav />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '96px', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 24px' }}>

          {/* Back to blog */}
          <Link to="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Geist', sans-serif", fontSize: '12px',
            color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
            marginBottom: '40px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            ← Blog
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
