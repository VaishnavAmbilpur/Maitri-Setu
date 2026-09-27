const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const incentiveSchemesData = require('../src/mockData/incentiveSchemes.json');

async function main() {
  console.log('🌱 Seeding MAITRI-Setu database...\n');

  // Clean existing data
  await prisma.applicationIncentive.deleteMany();
  await prisma.document.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.application.deleteMany();
  await prisma.incentive.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // --- USERS ---
  const passwordHash = await bcrypt.hash('password123', 10);

  const applicant = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'applicant@demo.com',
      passwordHash,
      role: 'applicant'
    }
  });

  const officer = await prisma.user.create({
    data: {
      name: 'Officer Priya Deshmukh',
      email: 'officer@demo.com',
      passwordHash,
      role: 'officer'
    }
  });

  const applicant2 = await prisma.user.create({
    data: {
      name: 'Anita Patel',
      email: 'anita@demo.com',
      passwordHash,
      role: 'applicant'
    }
  });

  console.log('  ✓ Created users (applicant@demo.com, officer@demo.com, anita@demo.com)');

  // --- INCENTIVE SCHEMES ---
  const incentives = [];
  for (const scheme of incentiveSchemesData) {
    const incentiveData = {
      ...scheme,
      eligibilityCriteria: typeof scheme.eligibilityCriteria === 'string'
        ? scheme.eligibilityCriteria
        : JSON.stringify(scheme.eligibilityCriteria)
    };
    const incentive = await prisma.incentive.create({ data: incentiveData });
    incentives.push(incentive);
  }
  console.log(`  ✓ Created ${incentives.length} incentive schemes`);

  // --- APPLICATION 1: Fully Approved (Manufacturing - Non-Polluting) ---
  const app1 = await prisma.application.create({
    data: {
      userId: applicant.id,
      sector: 'Manufacturing - Non-Polluting',
      location: 'Pune',
      investmentSize: '15000000',
      stage: 'New Setup',
      status: 'approved',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      approvals: {
        create: [
          {
            departmentName: 'Labour Department',
            approvalType: 'Factory Licence',
            status: 'approved',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            alertStatus: null
          },
          {
            departmentName: 'Fire Department',
            approvalType: 'Fire NOC',
            status: 'approved',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
            alertStatus: null
          },
          {
            departmentName: 'Electricity Board',
            approvalType: 'Electricity Connection',
            status: 'approved',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
            alertStatus: null
          }
        ]
      }
    }
  });
  console.log('  ✓ Application 1: ABC Manufacturing (Fully Approved)');

  // --- APPLICATION 2: In Progress with Near-Deadline (Manufacturing - Polluting) ---
  const app2 = await prisma.application.create({
    data: {
      userId: applicant.id,
      sector: 'Manufacturing - Polluting',
      location: 'Nashik',
      investmentSize: '8000000',
      stage: 'Expansion',
      status: 'submitted',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      approvals: {
        create: [
          {
            departmentName: 'Labour Department',
            approvalType: 'Factory Licence',
            status: 'approved',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            alertStatus: null
          },
          {
            departmentName: 'Fire Department',
            approvalType: 'Fire NOC',
            status: 'in_progress',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day away!
            alertStatus: 'warning'
          },
          {
            departmentName: 'Electricity Board',
            approvalType: 'Electricity Connection',
            status: 'approved',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            alertStatus: null
          },
          {
            departmentName: 'MPCB',
            approvalType: 'Pollution NOC',
            status: 'in_progress',
            isParallel: false,
            slaDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            alertStatus: null
          }
        ]
      }
    }
  });
  console.log('  ✓ Application 2: XYZ Industries (In Progress - Near Deadline)');

  // --- APPLICATION 3: SLA Breached (IT/Services) ---
  const app3 = await prisma.application.create({
    data: {
      userId: applicant2.id,
      sector: 'IT/Services',
      location: 'Mumbai',
      investmentSize: '25000000',
      stage: 'New Setup',
      status: 'submitted',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      approvals: {
        create: [
          {
            departmentName: 'Labour Department',
            approvalType: 'Factory Licence',
            status: 'in_progress',
            isParallel: true,
            slaDeadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days overdue!
            alertStatus: 'breached'
          },
          {
            departmentName: 'Electricity Board',
            approvalType: 'Electricity Connection',
            status: 'in_progress',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            alertStatus: null
          }
        ]
      }
    }
  });
  console.log('  ✓ Application 3: TechStart IT (SLA Breached)');

  // --- APPLICATION 4: Draft (Food Processing) ---
  const app4 = await prisma.application.create({
    data: {
      userId: applicant2.id,
      sector: 'Food Processing',
      location: 'Nagpur',
      investmentSize: '5000000',
      stage: 'New Setup',
      status: 'draft',
      approvals: {
        create: [
          {
            departmentName: 'Labour Department',
            approvalType: 'Factory Licence',
            status: 'pending',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          },
          {
            departmentName: 'Fire Department',
            approvalType: 'Fire NOC',
            status: 'pending',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
          },
          {
            departmentName: 'FSSAI',
            approvalType: 'Food Safety Licence',
            status: 'pending',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
          },
          {
            departmentName: 'Electricity Board',
            approvalType: 'Electricity Connection',
            status: 'pending',
            isParallel: true,
            slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          },
          {
            departmentName: 'MPCB',
            approvalType: 'Pollution NOC',
            status: 'pending',
            isParallel: false,
            slaDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    }
  });
  console.log('  ✓ Application 4: Nagpur Foods (Draft)');

  // --- MATCH INCENTIVES for applications ---
  // App1: Manufacturing - Non-Polluting, 15M → matches Green Industry, Employment Gen, MSME
  await prisma.applicationIncentive.createMany({
    data: [
      { applicationId: app1.id, incentiveId: incentives[0].id }, // MSME
      { applicationId: app1.id, incentiveId: incentives[1].id }, // Green Industry
      { applicationId: app1.id, incentiveId: incentives[3].id }  // Employment Gen
    ]
  });

  // App2: Manufacturing - Polluting, 8M → matches MSME, Employment Gen
  await prisma.applicationIncentive.createMany({
    data: [
      { applicationId: app2.id, incentiveId: incentives[0].id }, // MSME
      { applicationId: app2.id, incentiveId: incentives[3].id }  // Employment Gen
    ]
  });

  // App3: IT/Services, 25M → matches IT Park, Employment Gen
  await prisma.applicationIncentive.createMany({
    data: [
      { applicationId: app3.id, incentiveId: incentives[2].id }, // IT Park
      { applicationId: app3.id, incentiveId: incentives[3].id }  // Employment Gen
    ]
  });

  console.log('  ✓ Matched incentives to applications');

  // --- INSPECTIONS ---
  await prisma.inspection.create({
    data: {
      applicationId: app2.id,
      departmentsInvolved: JSON.stringify(['Fire Department', 'MPCB']),
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'scheduled'
    }
  });
  console.log('  ✓ Created sample inspection schedule');

  // --- SUMMARY ---
  console.log('\n✅ Seed complete!\n');
  console.log('  Demo Credentials:');
  console.log('  ├── Applicant: applicant@demo.com / password123');
  console.log('  ├── Applicant: anita@demo.com / password123');
  console.log('  └── Officer:   officer@demo.com / password123');
  console.log('\n  Applications:');
  console.log('  ├── ABC Manufacturing (Pune) — ✅ Fully Approved');
  console.log('  ├── XYZ Industries (Nashik) — ⚠️ In Progress, Fire NOC near deadline');
  console.log('  ├── TechStart IT (Mumbai) — 🔴 SLA Breached on Factory Licence');
  console.log('  └── Nagpur Foods (Nagpur) — ⬜ Draft');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
