import { db } from '../db';
import { sql } from 'drizzle-orm';
import { licensingAgreements, contentPricing } from '../schemas/licensing';

export async function seedLicensingData() {
  console.log('Seeding licensing data...');

  // Create licensing agreements for existing publishers
  const licensingAgreementsData = [
    {
      id: '21991dbb36be', // openssl rand -hex 6
      publisherId: 'e1d05990811c', // Austin Christian University (ACU)
      name: 'Standard Academic License 2024',
      monetaryRatePerByte: '0.000002',
      monetaryRatePerRequest: '0.045',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      id: 'dffa5eca5ccc', // openssl rand -hex 6
      publisherId: 'dffa5eca5ccc', // Indiana Wesleyan University (IWU)
      name: 'Premium Content Agreement',
      monetaryRatePerByte: '0.000003',
      monetaryRatePerRequest: '0.065',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      id: '88c7702ddabb', // openssl rand -hex 6
      publisherId: '88c7702ddabb', // Bethel Tech
      name: 'Basic Academic License',
      monetaryRatePerByte: '0.0000015',
      monetaryRatePerRequest: '0.035',
      effectiveDate: new Date('2024-01-01'),
    },
  ];

  for (const agreement of licensingAgreementsData) {
    await db
      .insert(licensingAgreements)
      .values(agreement)
      .onConflictDoNothing();
  }

  // Create content pricing for existing content items
  const contentPricingData = [
    // Austin Christian University (ACU) content
    {
      id: '21991dbb36bf', // openssl rand -hex 6
      contentItemId: '72f20c838bb0', // Introduction to Biblical Theology
      licensingAgreementId: '21991dbb36be',
      pricingModel: 'token_based',
      tokenCostPerByte: 1,
      tokenCostPerRequest: 10,
    },
    {
      id: '21991dbb36c0', // openssl rand -hex 6
      contentItemId: '43e1d7b2a6f3', // Church History: Early Christianity
      licensingAgreementId: '21991dbb36be',
      pricingModel: 'token_based',
      tokenCostPerByte: 1,
      tokenCostPerRequest: 8,
    },
    {
      id: '21991dbb36c1', // openssl rand -hex 6
      contentItemId: 'f1840d7a53bc', // Pastoral Leadership and Care
      licensingAgreementId: '21991dbb36be',
      pricingModel: 'free',
      tokenCostPerByte: null,
      tokenCostPerRequest: null,
    },

    // Indiana Wesleyan University (IWU) content
    {
      id: 'dffa5eca5ccd', // openssl rand -hex 6
      contentItemId: '9d12fa6e1c84', // Advanced Systematic Theology
      licensingAgreementId: 'dffa5eca5ccc',
      pricingModel: 'token_based',
      tokenCostPerByte: 2,
      tokenCostPerRequest: 15,
    },
    {
      id: 'dffa5eca5cce', // openssl rand -hex 6
      contentItemId: 'b6e7c9f43821', // Christian Apologetics in the Modern World
      licensingAgreementId: 'dffa5eca5ccc',
      pricingModel: 'token_based',
      tokenCostPerByte: 2,
      tokenCostPerRequest: 12,
    },

    // Bethel Tech content
    {
      id: '88c7702ddabc', // openssl rand -hex 6
      contentItemId: '5cf0e48b9d12', // AI Engineering for Kingdom Impact
      licensingAgreementId: '88c7702ddabb',
      pricingModel: 'token_based',
      tokenCostPerByte: 1,
      tokenCostPerRequest: 8,
    },
    {
      id: '88c7702ddabd', // openssl rand -hex 6
      contentItemId: '8be4d3920a6f', // Full-Stack Web Development for Ministry
      licensingAgreementId: '88c7702ddabb',
      pricingModel: 'free',
      tokenCostPerByte: null,
      tokenCostPerRequest: null,
    },
  ];

  for (const pricing of contentPricingData) {
    await db.insert(contentPricing).values(pricing).onConflictDoNothing();
  }

  console.log('✓ Licensing data seeded successfully');
}
