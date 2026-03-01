import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo admin – use this to sign in on the Staff Login tab
const DEMO_ADMIN_EMAIL = "admin@epaper.demo";
const DEMO_ADMIN_PASSWORD = "DemoAdmin123!";

// Public sample PDF (3 pages) for demo editions
const DEMO_PDF_URL = "https://www.africau.edu/images/default/sample.pdf";

async function main() {
  const hash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    create: {
      email: DEMO_ADMIN_EMAIL,
      name: "Demo Admin",
      passwordHash: hash,
      role: "SUPER_ADMIN",
      adminPermissions: {
        create: {
          canUpload: true,
          canEdit: true,
          canDelete: true,
          canManageUsers: true,
        },
      },
    },
    update: { passwordHash: hash, role: "SUPER_ADMIN" },
    include: { adminPermissions: true },
  });

  console.log("Demo admin:", admin.email);

  // Remove existing demo editions (same PDF URL) so we don't duplicate
  await prisma.editionPage.deleteMany({ where: { edition: { pdfKey: DEMO_PDF_URL } } });
  await prisma.edition.deleteMany({ where: { pdfKey: DEMO_PDF_URL } });

  const demoDates = [
    new Date(),
    new Date(Date.now() - 86400 * 1000),
    new Date(Date.now() - 86400 * 2 * 1000),
    new Date(Date.now() - 86400 * 3 * 1000),
  ];

  const regions = ["National", "Metro", "Regional", "City"];

  for (let i = 0; i < demoDates.length; i++) {
    const edition = await prisma.edition.create({
      data: {
        date: demoDates[i],
        region: regions[i],
        language: "en",
        totalPages: 3,
        pdfKey: DEMO_PDF_URL,
        isPublished: true,
        pages: {
          create: [1, 2, 3].map((pageNumber) => ({
            pageNumber,
            imageKey: DEMO_PDF_URL,
          })),
        },
      },
    });
    console.log("Demo edition:", edition.date.toISOString().slice(0, 10), edition.region);
  }

  console.log("\n--- Demo credentials (Staff Login tab) ---");
  console.log("Email:", DEMO_ADMIN_EMAIL);
  console.log("Password:", DEMO_ADMIN_PASSWORD);
  console.log("------------------------------------------\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
