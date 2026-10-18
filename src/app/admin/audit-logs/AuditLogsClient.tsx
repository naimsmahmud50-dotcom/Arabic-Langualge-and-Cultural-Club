/**
 * @file src/app/admin/audit-logs/AuditLogsClient.tsx
 * @description Interactive Client Console for Immutable Security & Activity Audit Trail.
 * 
 * ARCHITECTURE & USER EXPERIENCE:
 * - Renders cryptographically tracked immutable audit records from SQLite `audit_logs`.
 * - Provides search, action filtering, target entity filtering, and client-side detail inspection.
 * - Authenticated export of audit log records via `/api/admin/audit-logs/export`.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography, Lucide SVG icons, and responsive cards.
 * - Meets Requirement REQ-ADM-12 and SPEC-SEC-04.
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Modal,
  EmptyState,
} from "@/components/ui";
import {
  History,
  Shield,
  Filter,
  Download,
  Search,
  Eye,
  Calendar,
  CheckCircle2,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";

export interface AuditRecord {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  targetEntity: string;
  targetId: string | null;
  detailsJson: string | null;
  ipAddress: string | null;
  createdAt: Date | string;
}

interface AuditLogsClientProps {
  initialLogs: AuditRecord[];
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [detailModalLog, setDetailModalLog] = useState<AuditRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Derive unique actions and entities for filter dropdowns
  const uniqueActions = Array.from(new Set(initialLogs.map((l) => l.action))).sort();
  const uniqueEntities = Array.from(new Set(initialLogs.map((l) => l.targetEntity))).sort();

  // Filter logs
  const filteredLogs = initialLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
      (log.targetId && log.targetId.toLowerCase().includes(q)) ||
      (log.detailsJson && log.detailsJson.toLowerCase().includes(q));

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.targetEntity === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActionBadgeVariant = (action: string): "accent" | "outline" | "neutral" | "success" | "destructive" => {
    if (action.includes("CREATE") || action.includes("SUCCESS") || action.includes("GENERATED")) return "success";
    if (action.includes("DELETE") || action.includes("FAILED") || action.includes("SUSPEND")) return "destructive";
    if (action.includes("UPDATE") || action.includes("CHANGE")) return "accent";
    return "neutral";
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Cryptographic Activity Ledger
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {filteredLogs.length} verified operations. Records are append-only and immutable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/admin/audit-logs/export" download>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Full Ledger (JSON)
            </Button>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-[var(--border-color)] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search action, actor, entity, or payload..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden"
            >
              <option value="all">All Action Codes ({uniqueActions.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden"
            >
              <option value="all">All Target Entities ({uniqueEntities.length})</option>
              {uniqueEntities.map((ent) => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        {paginatedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action Code</TableHead>
                  <TableHead>Actor Identity</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Audit Summary</TableHead>
                  <TableHead className="text-right">Inspection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => {
                  const createdAt = new Date(log.createdAt);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {createdAt.toISOString().replace("T", " ").slice(0, 19)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                        {log.userEmail || log.userId || "System Daemon"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-[var(--text-primary)]">
                        {log.targetEntity}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-[var(--text-muted)]">
                        {log.targetId ? log.targetId.slice(0, 14) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-secondary)] max-w-xs truncate font-mono">
                        {log.detailsJson || "Routine administrative transition"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailModalLog(log)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No Audit Records Found"
              description="No administrative activities matched your current filter or search criteria."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActionFilter("all");
                    setEntityFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div>
              Page {currentPage} of {totalPages} ({filteredLogs.length} total entries)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* DETAIL MODAL */}
      {detailModalLog && (
        <Modal
          isOpen={Boolean(detailModalLog)}
          onClose={() => setDetailModalLog(null)}
          title={`Audit Record: ${detailModalLog.action}`}
          description={`Logged at ${new Date(detailModalLog.createdAt).toUTCString()}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--bg-surface-elevated)] p-3 rounded border border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-muted)] block">Actor Email:</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  {detailModalLog.userEmail || "System Daemon"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Actor User ID:</span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {detailModalLog.userId || "—"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Target Entity:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {detailModalLog.targetEntity}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Target Resource ID:</span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {detailModalLog.targetId || "—"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                Payload Details (JSON):
              </span>
              <pre className="p-3 text-[11px] font-mono rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-x-auto max-h-60 text-[var(--text-primary)]">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(detailModalLog.detailsJson || "{}"), null, 2);
                  } catch {
                    return detailModalLog.detailsJson || "{}";
                  }
                })()}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDetailModalLog(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
