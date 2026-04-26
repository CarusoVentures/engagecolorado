// Vercel Edge Function — generates the Open Graph share image at /api/og
// 1200x630 PNG with EC monogram + wordmark + tagline.
//
// Uses @vercel/og's plain-object element syntax (no JSX/React build step).
// Default fonts apply (Inter family); typography on-brand serif italic
// is a TODO — would require fetching Newsreader font file at request time
// or bundling as a static asset.

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const NAVY = '#0f2638';
const ACCENT = '#1a3a52';
const TERRACOTTA = '#b86b34';
const BEIGE_BG = '#f0eee9';
const BEIGE_BORDER = '#e0dcd2';
const SLATE = '#1f2937';

function el(type, style, children) {
  return { type, props: { style, children } };
}

export default function handler() {
  return new ImageResponse(
    el(
      'div',
      {
        width: '1200px',
        height: '630px',
        background: BEIGE_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
      [
        // EC monogram — white card with navy letters
        el(
          'div',
          {
            width: '220px',
            height: '220px',
            background: '#ffffff',
            border: `2px solid ${BEIGE_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          el(
            'div',
            {
              fontSize: '170px',
              fontStyle: 'italic',
              fontWeight: 500,
              color: ACCENT,
              letterSpacing: '-4px',
              lineHeight: 1,
              fontFamily: 'Georgia, "Times New Roman", serif',
            },
            'EC'
          )
        ),
        // Wordmark
        el(
          'div',
          {
            marginTop: '50px',
            fontSize: '92px',
            fontStyle: 'italic',
            fontWeight: 400,
            color: NAVY,
            letterSpacing: '-2px',
            lineHeight: 1,
            fontFamily: 'Georgia, "Times New Roman", serif',
          },
          'Engage Colorado'
        ),
        // Small terracotta divider
        el(
          'div',
          {
            marginTop: '28px',
            width: '60px',
            height: '3px',
            background: TERRACOTTA,
          },
          ''
        ),
        // Tagline
        el(
          'div',
          {
            marginTop: '28px',
            fontSize: '34px',
            fontStyle: 'italic',
            fontWeight: 400,
            color: SLATE,
            lineHeight: 1.35,
            textAlign: 'center',
            maxWidth: '960px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          },
          "Colorado's Journey to Become the World's Top Innovation Ecosystem"
        ),
      ]
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
