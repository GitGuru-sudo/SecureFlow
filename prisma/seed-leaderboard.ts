import prisma from "../src/lib/prisma";

/**
 * Wipe the database and reseed it with REAL GitHub users so the public
 * contribution leaderboard has enough people to display.
 *
 * Points model: 1 ⭐ = 1 merged PR. For each user we create `merged` pull
 * requests in state "merged" (they earn stars) plus a few "open" ones (so the
 * "PRs" total is higher than the star count, like real activity).
 *
 * Run:  npx tsx prisma/seed-leaderboard.ts
 * Then: npx tsx prisma/seed.ts   (restores PolicyTemplate config)
 */

// Owner of the seeded repo (also a real user).
const OWNER = {
  login: "GitGuru-sudo",
  name: "Saksham Arora",
  email: "saksham@secureflow.dev",
  avatar: "https://avatars.githubusercontent.com/u/184630072?v=4",
};

// Real GitHub contributors of GauravKarakoti/SecureFlow.
// `merged` -> stars; `open` -> extra non-merged PRs for a realistic PR total.
const CONTRIBUTORS: { login: string; avatar: string; merged: number; open: number }[] = [
  { login: "GauravKarakoti",     avatar: "https://avatars.githubusercontent.com/u/180496085?v=4", merged: 24, open: 5 },
  { login: "GitGuru-sudo",       avatar: "https://avatars.githubusercontent.com/u/184630072?v=4", merged: 18, open: 3 },
  { login: "adityakrmishra",     avatar: "https://avatars.githubusercontent.com/u/154746713?v=4", merged: 15, open: 4 },
  { login: "mrunmayeekokitkar",  avatar: "https://avatars.githubusercontent.com/u/184808271?v=4", merged: 9,  open: 2 },
  { login: "Yuva-Deekshitha-N",  avatar: "https://avatars.githubusercontent.com/u/153242050?v=4", merged: 6,  open: 1 },
  { login: "revatikadam0607",    avatar: "https://avatars.githubusercontent.com/u/261348571?v=4", merged: 6,  open: 2 },
  { login: "BikramMondal5",      avatar: "https://avatars.githubusercontent.com/u/170235967?v=4", merged: 4,  open: 1 },
];

async function wipe() {
  console.log("Wiping database…");
  // Child → parent order to satisfy foreign keys.
  await prisma.finding.deleteMany();
  await prisma.scanResult.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.pullRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userPolicyToggle.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.policyTemplate.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ all tables cleared");
}

async function seed() {
  await wipe();

  // 1) Owner user
  const owner = await prisma.user.create({
    data: { name: OWNER.name, email: OWNER.email, image: OWNER.avatar },
  });

  // 2) A repo for the PRs to hang off of
  const repo = await prisma.repository.create({
    data: {
      githubId: BigInt(823456789),
      fullName: "GauravKarakoti/SecureFlow",
      owner: "GauravKarakoti",
      userId: owner.id,
    },
  });

  // 3) Pull requests — merged (stars) + open (activity)
  let githubId = 9_000_000_000; // synthetic, unique
  let prNumber = 1;
  const prRows: any[] = [];

  for (const c of CONTRIBUTORS) {
    for (let i = 0; i < c.merged; i++) {
      prRows.push({
        githubId: BigInt(githubId++),
        prNumber: prNumber++,
        title: `${c.login}: merged contribution #${i + 1}`,
        state: "merged",
        status: "PASS",
        repositoryId: repo.id,
        authorLogin: c.login,
        authorAvatarUrl: c.avatar,
      });
    }
    for (let i = 0; i < c.open; i++) {
      prRows.push({
        githubId: BigInt(githubId++),
        prNumber: prNumber++,
        title: `${c.login}: open contribution #${i + 1}`,
        state: "open",
        status: "REVIEW REQUIRED",
        repositoryId: repo.id,
        authorLogin: c.login,
        authorAvatarUrl: c.avatar,
      });
    }
  }

  await prisma.pullRequest.createMany({ data: prRows });

  const merged = prRows.filter((p) => p.state === "merged").length;
  console.log(`Seeded ${CONTRIBUTORS.length} contributors, ${prRows.length} PRs (${merged} merged / stars).`);
  console.log("Standings (by stars):");
  [...CONTRIBUTORS]
    .sort((a, b) => b.merged - a.merged)
    .forEach((c, i) => console.log(`  #${i + 1}  ${c.login.padEnd(20)} ${c.merged} ★`));
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
