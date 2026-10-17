/**
 * @file src/app/admin/pages/page.tsx
 * @route /admin/pages
 * @description CMS Page & Section Content Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows executive administrators to update editable sections across the public site
 *   (Hero text, About intro, Constitution text, Mission/Vision/Values) in English & Arabic.
 * - Meets Requirement SPEC-PAG-01 through SPEC-PAG-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { FileText, Edit, Plus, Eye, History } from "lucide-react";
import Link from "next/link";

export default function AdminPagesCMS() {
  const pagesList = [
    { slug: "home", title: "Homepage Narrative & Pillars", sections: 4, lastUpdated: "2024-09-15", status: "Published" },
    { slug: "about", title: "About Us & Institutional Mission", sections: 3, lastUpdated: "2024-09-10", status: "Published" },
    { slug: "history", title: "Timeline & Milestones", sections: 5, lastUpdated: "2024-09-12", status: "Published" },
    { slug: "policies", title: "Privacy, Data Protection & Accessibility", sections: 3, lastUpdated: "2024-08-20", status: "Published" },
    { slug: "contact", title: "Secretariat Coordinates & Office Hours", sections: 2, lastUpdated: "2024-09-01", status: "Published" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Page Content & Sections CMS"
        subtitle="Manage bilingual copy, mission statements, and institutional narratives"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Managed Public Pages
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Select a page to edit bilingual text, calligraphy banners, and section metadata.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Custom Page Section
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Identifier</TableHead>
                <TableHead>Page Title</TableHead>
                <TableHead>Active Sections</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagesList.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell className="font-mono text-xs text-[var(--brand-accent)] font-semibold">
                    /{p.slug === "home" ? "" : p.slug}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-[var(--text-primary)]">
                    {p.title}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)]">
                    {p.sections} sections
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                    {p.lastUpdated}
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent" size="sm">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit Content
                    </Button>
                    <Link href={`/${p.slug === "home" ? "" : p.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                    </Link>
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
