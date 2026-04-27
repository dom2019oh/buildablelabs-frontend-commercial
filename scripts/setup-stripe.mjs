// Buildable Labs — Stripe Product & Price Setup
// Run: node scripts/setup-stripe.mjs
// Creates all Pro and Max products/prices and outputs Railway env vars.

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error('Set STRIPE_SECRET_KEY env var before running.'); process.exit(1); }

const PRO_TIERS = [
  { id: 'pro-t1',  credits: 30,   monthly: 1800,  annual: 18000  },
  { id: 'pro-t2',  credits: 60,   monthly: 3600,  annual: 36000  },
  { id: 'pro-t3',  credits: 90,   monthly: 5500,  annual: 55000  },
  { id: 'pro-t4',  credits: 120,  monthly: 7200,  annual: 72000  },
  { id: 'pro-t5',  credits: 150,  monthly: 8900,  annual: 89000  },
  { id: 'pro-t6',  credits: 180,  monthly: 10800, annual: 108000 },
  { id: 'pro-t7',  credits: 210,  monthly: 12500, annual: 125000 },
  { id: 'pro-t8',  credits: 240,  monthly: 14400, annual: 144000 },
  { id: 'pro-t9',  credits: 270,  monthly: 16200, annual: 162000 },
  { id: 'pro-t10', credits: 300,  monthly: 17900, annual: 179000 },
];

const MAX_TIERS = [
  { id: 'max-t1',  credits: 100,  monthly: 5900,  annual: 59000  },
  { id: 'max-t2',  credits: 200,  monthly: 11900, annual: 119000 },
  { id: 'max-t3',  credits: 300,  monthly: 17900, annual: 179000 },
  { id: 'max-t4',  credits: 400,  monthly: 23900, annual: 239000 },
  { id: 'max-t5',  credits: 500,  monthly: 29900, annual: 299000 },
  { id: 'max-t6',  credits: 600,  monthly: 35900, annual: 359000 },
  { id: 'max-t7',  credits: 700,  monthly: 41900, annual: 419000 },
  { id: 'max-t8',  credits: 800,  monthly: 47900, annual: 479000 },
  { id: 'max-t9',  credits: 900,  monthly: 53900, annual: 539000 },
  { id: 'max-t10', credits: 1000, monthly: 59900, annual: 599000 },
];

async function stripe(method, path, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(KEY + ':').toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (body) {
    opts.body = new URLSearchParams(body).toString();
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, opts);
  const data = await res.json();
  if (data.error) throw new Error(`Stripe error on ${method} ${path}: ${data.error.message}`);
  return data;
}

async function createProduct(name, description, metadata) {
  return stripe('POST', '/products', { name, description, ...Object.fromEntries(Object.entries(metadata).map(([k,v]) => [`metadata[${k}]`, v])) });
}

async function createPrice(productId, amount, interval, tierId, credits, nickname) {
  const body = {
    product: productId,
    unit_amount: amount,
    currency: 'usd',
    'recurring[interval]': interval,
    nickname,
    [`metadata[tier_id]`]: tierId,
    [`metadata[credits]`]: String(credits),
  };
  return stripe('POST', '/prices', body);
}

async function main() {
  console.log('Creating Buildable Labs Stripe products and prices...\n');

  const envVars = {};

  // ── Pro Plan ─────────────────────────────────────────────────────────────────
  console.log('Creating Pro product...');
  const proProd = await createProduct(
    'Buildable Labs — Pro',
    'Everything you need to build seriously. Full 8-stage AI pipeline (Claude Haiku + Sonnet), up to 10 active bots, no Buildable watermark, and 1-month credit rollover.',
    { plan_type: 'pro' }
  );
  console.log(`  Pro product: ${proProd.id}`);

  for (const tier of PRO_TIERS) {
    const envKey = tier.id.toUpperCase().replace('-', '_');

    // Monthly
    const monthly = await createPrice(proProd.id, tier.monthly, 'month', tier.id, tier.credits, `Pro ${tier.credits} credits/month`);
    envVars[`STRIPE_PRICE_${envKey}`] = monthly.id;
    console.log(`  ${tier.id} monthly → ${monthly.id}`);

    // Annual
    const annual = await createPrice(proProd.id, tier.annual, 'year', `${tier.id}-annual`, tier.credits, `Pro ${tier.credits} credits/year`);
    envVars[`STRIPE_PRICE_${envKey}_ANNUAL`] = annual.id;
    console.log(`  ${tier.id} annual  → ${annual.id}`);
  }

  // ── Max Plan ─────────────────────────────────────────────────────────────────
  console.log('\nCreating Max product...');
  const maxProd = await createProduct(
    'Buildable Labs Max',
    'Priority queue, unlimited bots, REST API, white-label, 2-month rollover.',
    { plan_type: 'max' }
  );
  console.log(`  Max product: ${maxProd.id}`);

  for (const tier of MAX_TIERS) {
    const envKey = tier.id.toUpperCase().replace('-', '_');

    const monthly = await createPrice(maxProd.id, tier.monthly, 'month', tier.id, tier.credits, `Max ${tier.credits} credits/month`);
    envVars[`STRIPE_PRICE_${envKey}`] = monthly.id;
    console.log(`  ${tier.id} monthly → ${monthly.id}`);

    const annual = await createPrice(maxProd.id, tier.annual, 'year', `${tier.id}-annual`, tier.credits, `Max ${tier.credits} credits/year`);
    envVars[`STRIPE_PRICE_${envKey}_ANNUAL`] = annual.id;
    console.log(`  ${tier.id} annual  → ${annual.id}`);
  }

  // ── Output env vars ───────────────────────────────────────────────────────────
  console.log('\n\n════════════════════════════════════════════════════════');
  console.log('RAILWAY ENV VARS — paste these into Railway dashboard');
  console.log('════════════════════════════════════════════════════════\n');
  for (const [k, v] of Object.entries(envVars)) {
    console.log(`${k}=${v}`);
  }
  console.log('\nSTRIPE_REDIRECT_BASE=https://buildablelabs.dev');
  console.log('\n════════════════════════════════════════════════════════');
  console.log('Also set in Railway:');
  console.log('  STRIPE_SECRET_KEY=<your sk_live_ or rk_live_ key>');
  console.log('  STRIPE_WEBHOOK_SECRET=<from Stripe webhook dashboard>');
  console.log('════════════════════════════════════════════════════════\n');

  // Write to file for easy copy
  const lines = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
  const { writeFileSync } = await import('fs');
  writeFileSync('stripe-env-vars.txt', lines + '\nSTRIPE_REDIRECT_BASE=https://buildablelabs.dev\n');
  console.log('Saved to stripe-env-vars.txt\n');
}

main().catch(err => { console.error(err.message); process.exit(1); });
