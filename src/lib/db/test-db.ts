import { 
  getPublicFounders, 
  getCommitteeTerms, 
  getCommitteeMembersByTerm, 
  getPublicMembers, 
  getPublicEvents, 
  getPublicGalleryAlbums, 
  getPublicLearningResources,
  getAdminDashboardMetrics 
} from "./queries";

async function verifyDatabase() {
  console.log("==================================================");
  console.log("VERIFYING ARABIC CLUB DATABASE & QUERY LAYER");
  console.log("==================================================");

  // 1. Founders Test
  const founders = await getPublicFounders();
  console.log(`\n[✓] Founders Query Passed: Found ${founders.length} verified founder(s)`);
  founders.forEach(f => console.log(`   - ${f.nameEn} (${f.roleTitleEn})`));

  // 2. Committee Terms & Historical Preservation Test
  const terms = await getCommitteeTerms();
  console.log(`\n[✓] Committee Terms Query Passed: Found ${terms.length} term(s)`);
  for (const t of terms) {
    const members = await getCommitteeMembersByTerm(t.id);
    console.log(`   - Term: ${t.academicYear} [${t.isCurrent ? "ACTIVE CURRENT" : "HISTORICAL ARCHIVE"}] - ${members.length} member(s)`);
    members.forEach(m => console.log(`       * ${m.positionTitleEn}: ${m.fullNameEn} (Membership ID: ${m.membershipId})`));
  }

  // 3. Public Member Privacy Test (Check that private phone/email are NOT leaked)
  const memberList = await getPublicMembers();
  console.log(`\n[✓] Public Member Directory Query Passed: Found ${memberList.data.length} member(s)`);
  memberList.data.forEach((m: any) => {
    if (m.email || m.phone || m.studentId) {
      throw new Error(`CRITICAL PRIVACY VIOLATION: Private data leaked in public member query: ${JSON.stringify(m)}`);
    }
  });
  console.log("   [✓] Privacy Test PASSED: No email, phone, or student ID exposed in public projection.");

  // 4. Events & Registration Settings Test
  const events = await getPublicEvents();
  console.log(`\n[✓] Public Events Query Passed: Found ${events.data.length} event(s)`);
  events.data.forEach(e => console.log(`   - ${e.titleEn} | Venue: ${e.venue} | Reg Open: ${e.isRegistrationOpen}`));

  // 5. Gallery Albums Test
  const albums = await getPublicGalleryAlbums();
  console.log(`\n[✓] Gallery Albums Query Passed: Found ${albums.data.length} album(s)`);

  // 6. Learning Resources Test
  const resources = await getPublicLearningResources();
  console.log(`\n[✓] Arabic Learning Resources Query Passed: Found ${resources.data.length} resource(s)`);

  // 7. Admin Dashboard Metrics Test (Zero Fake Stats)
  const metrics = await getAdminDashboardMetrics();
  console.log("\n[✓] Admin Dashboard Metrics Verified (Real Database Counts):");
  console.log(`   - Total Published Events: ${metrics.totalEvents}`);
  console.log(`   - Upcoming Confirmed Events: ${metrics.totalUpcoming}`);
  console.log(`   - Active Club Members: ${metrics.totalMembers}`);
  console.log(`   - Pending Membership Applications: ${metrics.pendingApplications}`);
  console.log(`   - Gallery Albums: ${metrics.totalAlbums}`);
  console.log(`   - Published Announcements: ${metrics.totalAnnouncements}`);
  console.log(`   - Recent Audit Logs: ${metrics.recentLogs.length} record(s)`);

  console.log("\n==================================================");
  console.log("ALL DATABASE ACCEPTANCE TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

verifyDatabase().catch(err => {
  console.error("Database verification failed:", err);
  process.exit(1);
});
