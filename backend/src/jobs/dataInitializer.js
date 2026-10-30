const bcrypt = require('bcryptjs');
const { ComplaintCategory, User } = require('../models');
const env = require('../config/env');

const STANDARD_CATEGORIES = [
  {
    name: 'Road Damage',
    code: 'ROAD',
    description: 'Potholes, broken asphalt, dangerous cracks and damaged pavements',
    weight: 20,
    icon: 'Construction',
    active: true,
  },
  {
    name: 'Garbage & Sanitation',
    code: 'GARBAGE',
    description: 'Uncollected garbage, overflowing dumpsters and litter hotspots',
    weight: 15,
    icon: 'Trash2',
    active: true,
  },
  {
    name: 'Streetlight Outage',
    code: 'LIGHT',
    description: 'Dark intersections, flickering lamps, and non-functional street fixtures',
    weight: 10,
    icon: 'Lightbulb',
    active: true,
  },
  {
    name: 'Water Supply',
    code: 'WATER',
    description: 'Pipeline bursts, low pressure, dirty water, and distribution leaks',
    weight: 25,
    icon: 'Droplets',
    active: true,
  },
  {
    name: 'Drainage & Sewage',
    code: 'DRAINAGE',
    description: 'Blocked storm drains, sewage overflows, and standing contaminated water',
    weight: 25,
    icon: 'Waves',
    active: true,
  },
  {
    name: 'Public Safety & Hazards',
    code: 'SAFETY',
    description: 'Exposed electrical cables, open manholes, falling tree limbs, and building hazards',
    weight: 30,
    icon: 'AlertTriangle',
    active: true,
  },
  {
    name: 'Other Civic Issues',
    code: 'OTHER',
    description: 'Other community infrastructure and municipal maintenance concerns',
    weight: 5,
    icon: 'HelpCircle',
    active: true,
  },
];

const seedCategories = async () => {
  const count = await ComplaintCategory.countDocuments();
  if (count === 0) {
    console.log('[DataInitializer] Seeding standard municipal complaint categories...');
    await ComplaintCategory.insertMany(STANDARD_CATEGORIES);
    console.log(`[DataInitializer] Successfully seeded ${STANDARD_CATEGORIES.length} categories.`);
  }
};

const seedInitialAdmin = async () => {
  const adminCount = await User.countDocuments({ role: 'ROLE_ADMIN' });
  if (adminCount > 0) {
    console.log('[DataInitializer] Administrator account already exists. Skipping initialization.');
    return;
  }

  if (!env.ADMIN_PASSWORD || !env.ADMIN_PASSWORD.trim()) {
    console.log(
      '[DataInitializer] CIVICFIX_ADMIN_PASSWORD environment variable is not configured. Admin bootstrapping deferred.'
    );
    return;
  }

  const existingEmail = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  const existingUsername = await User.findOne({ username: env.ADMIN_USERNAME });

  if (existingEmail || existingUsername) {
    console.log('[DataInitializer] Initial admin username or email already exists in users. Skipping.');
    return;
  }

  console.log(`[DataInitializer] Bootstrapping primary administrator account: ${env.ADMIN_EMAIL}`);
  const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  await User.create({
    username: env.ADMIN_USERNAME,
    email: env.ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    fullName: env.ADMIN_FULL_NAME,
    role: 'ROLE_ADMIN',
    active: true,
  });

  console.log('[DataInitializer] Primary administrator account initialized successfully.');
};

const initializeData = async () => {
  try {
    await seedCategories();
    await seedInitialAdmin();
  } catch (error) {
    console.error('[DataInitializer Error] Failed during data initialization:', error.message);
  }
};

module.exports = {
  initializeData,
  seedCategories,
  seedInitialAdmin,
  STANDARD_CATEGORIES,
};
