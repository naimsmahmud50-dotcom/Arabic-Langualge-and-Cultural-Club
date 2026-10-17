/**
 * @file src/app/admin/members/page.tsx
 * @route /admin/members
 * @description Administrative Member Records & Verification Console.
 * 
 * ARCHITECTURE & ROLE:
 * - Authorized administrative repository containing full member records
 *   (including private contact details, student IDs, and verification status).
 * - Meets Requirement SPEC-MEM-01 through SPEC-MEM-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from "@/components/ui";
import { UserCheck, Plus, Search, Filter, Mail, Phone, Shield } from "lucide-react";

export default function AdminMembersPage() {
  const sampleMembers = [
    { id: "1", ref: "ARB-2024-001", name: "Zaid Ibn Tariq", nameAr: "زيد بن طارق", studentId: "2024-ARB-001", dept: "Arabic Literature", email: "zaid.tariq@university.edu", phone: "+880 1711-111111", status: "active", isPublic: true },
    { id: "2", ref: "ARB-2024-002", name: "Fatima Al-Zahra", nameAr: "فاطمة الزهراء", studentId: "2024-ARB-002", dept: "Islamic Studies", email: "fatima.z@university.edu", phone: "+880 1722-222222", status: "active", isPublic: true },
    { id: "3", ref: "ARB-2024-003", name: "Umar Farooq", nameAr: "عمر فاروق", studentId: "2024-ARB-003", dept: "Comparative Law", email: "umar.f@university.edu", phone: "+880 1733-333333", status: "active", isPublic: false },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Member Records & Verification"
        subtitle="Manage student fellows, enrollment credentials, and privacy consent status"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-md relative">
            <input
              type="text"
              placeholder="Search by student ID, name, email, or ref..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export Roster (CSV)
            </Button>
            <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Manually Register Fellow
            </Button>
          </div>
        </div>

        <Card className="border-[var(--border-color)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Full Name (EN / AR)</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Private Contacts</TableHead>
                <TableHead>Directory Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    {m.ref}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{m.name}</div>
                    <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{m.nameAr}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--text-muted)]">
                    {m.studentId}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)]">
                    {m.dept}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)] space-y-0.5">
                    <div className="flex items-center gap-1 font-mono text-[11px]"><Mail className="w-3 h-3" /> {m.email}</div>
                    <div className="flex items-center gap-1 font-mono text-[11px]"><Phone className="w-3 h-3" /> {m.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.isPublic ? "accent" : "neutral"} size="sm">
                      {m.isPublic ? "Public Directory" : "Private / Redacted"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent" size="sm">{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
