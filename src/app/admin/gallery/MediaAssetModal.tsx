/**
 * DEVELOPER NOTE:
 * @file src/app/admin/gallery/MediaAssetModal.tsx
 * @description Administrative Media Asset Manager with Batch Uploads & Metadata Control (Phase 5).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * CORE CAPABILITIES:
 * - Multi-file Drag-and-Drop Batch Uploads with live thumbnail previews before submission.
 * - Server-side upload handler integration (/api/admin/gallery/upload) with progress tracking.
 * - Strix-Supabase Security: Whitelisted MIME types, file size limits, rejection of scripts/SVGs.
 * - Multi-selection and Safe Bulk Operations: Bulk Publish, Bulk Unpublish, Bulk Delete.
 * - Granular Metadata Editing: English/Arabic captions, accessibility alt_text, credits, display sort order.
 * - Direct Album Cover assignment with prominent visual badge.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useRef } from "react";
import { Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileCheck, 
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { 
  saveMediaAssetAction, 
  deleteMediaAssetAction, 
  setAlbumCoverAction,
  bulkUpdateMediaAssetsAction,
  reorderMediaAssetsAction 
} from "@/lib/actions/content-cms";

export interface MediaItem {
  id: string;
  albumId: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  captionEn?: string | null;
  captionAr?: string | null;
  altText?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface AlbumContext {
  id: string;
  titleEn: string;
  slug: string;
  academicYear: string;
  coverImageUrl?: string | null;
  photographerCredit?: string | null;
  assets?: MediaItem[];
}

interface MediaAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  album: AlbumContext | null;
}

interface PendingFilePreview {
  file: File;
  previewUrl: string;
  id: string;
}

export function MediaAssetModal({
  isOpen,
  onClose,
  onSuccess,
  album,
}: MediaAssetModalProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "batch-upload" | "add-url">("gallery");

  // Selection state for bulk operations
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Metadata editor modal state
  const [editingAsset, setEditingAsset] = useState<MediaItem | null>(null);

  // Batch upload state
  const [pendingFiles, setPendingFiles] = useState<PendingFilePreview[]>([]);
  const [batchCaption, setBatchCaption] = useState("");
  const [batchCredit, setBatchCredit] = useState(album?.photographerCredit || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Single URL / Embed Form State
  const [urlFormData, setUrlFormData] = useState({
    fileUrl: "",
    thumbnailUrl: "",
    mediaType: "image" as "image" | "video",
    videoUrl: "",
    captionEn: "",
    captionAr: "",
    altText: "",
    credit: "",
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen || !album) return null;

  const currentAssets = album.assets || [];

  // --------------------------------------------------------------------------
  // BATCH UPLOAD HANDLERS
  // --------------------------------------------------------------------------

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const newPreviews: PendingFilePreview[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push({
        file,
        previewUrl,
        id: `prev_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      });
    }

    setPendingFiles((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleClearPendingFiles = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const handleExecuteBatchUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("albumId", album.id);
    if (batchCaption.trim()) {
      formData.append("defaultCaption", batchCaption.trim());
    }
    if (batchCredit.trim()) {
      formData.append("defaultCredit", batchCredit.trim());
    }

    pendingFiles.forEach((p) => {
      formData.append("files", p.file);
    });

    try {
      setUploadProgress(40);
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Batch upload encountered an error.");
      }

      setUploadProgress(100);
      setStatusMessage({
        type: "success",
        text: `Successfully ingested ${data.summary?.succeeded || pendingFiles.length} media assets into this album.`,
      });

      handleClearPendingFiles();
      setBatchCaption("");
      setActiveTab("gallery");
      onSuccess();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to complete batch upload.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --------------------------------------------------------------------------
  // SINGLE URL REGISTRATION
  // --------------------------------------------------------------------------

  const handleCreateAssetByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlFormData.fileUrl.trim()) {
      setStatusMessage({ type: "error", text: "Media File URL is required." });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await saveMediaAssetAction({
        albumId: album.id,
        fileUrl: urlFormData.fileUrl.trim(),
        thumbnailUrl: urlFormData.thumbnailUrl.trim() || null,
        mediaType: urlFormData.mediaType,
        videoUrl: urlFormData.videoUrl.trim() || null,
        captionEn: urlFormData.captionEn.trim() || null,
        captionAr: urlFormData.captionAr.trim() || null,
        altText: urlFormData.altText.trim() || null,
        credit: urlFormData.credit.trim() || null,
        sortOrder: currentAssets.length + 1,
        isPublished: urlFormData.isPublished,
      });

      if (!res.success) {
        setStatusMessage({ type: "error", text: res.error || "Failed to register media asset." });
      } else {
        setStatusMessage({ type: "success", text: "Media asset registered successfully." });
        setUrlFormData({
          fileUrl: "",
          thumbnailUrl: "",
          mediaType: "image",
          videoUrl: "",
          captionEn: "",
          captionAr: "",
          altText: "",
          credit: "",
          isPublished: true,
        });
        setActiveTab("gallery");
        onSuccess();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to register media asset." });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // METADATA EDITING
  // --------------------------------------------------------------------------

  const handleSaveMetadataEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    setIsLoading(true);
    try {
      const res = await saveMediaAssetAction({
        id: editingAsset.id,
        albumId: editingAsset.albumId,
        fileUrl: editingAsset.fileUrl,
        thumbnailUrl: editingAsset.thumbnailUrl || null,
        mediaType: editingAsset.mediaType,
        videoUrl: editingAsset.videoUrl || null,
        captionEn: editingAsset.captionEn || null,
        captionAr: editingAsset.captionAr || null,
        altText: editingAsset.altText || null,
        credit: editingAsset.credit || null,
        sortOrder: editingAsset.sortOrder,
        isPublished: editingAsset.isPublished,
      });

      if (res.success) {
        setEditingAsset(null);
        setStatusMessage({ type: "success", text: "Media metadata updated successfully." });
        onSuccess();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update metadata." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // BULK ACTIONS
  // --------------------------------------------------------------------------

  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === currentAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(currentAssets.map((a) => a.id));
    }
  };

  const handleToggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedAssetIds.length === 0) return;

    if (action === "delete") {
      const confirmed = confirm(
        `Are you sure you want to permanently delete ${selectedAssetIds.length} selected media assets? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await bulkUpdateMediaAssetsAction(selectedAssetIds, action, album.id);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Bulk ${action} applied successfully to ${selectedAssetIds.length} assets.`,
        });
        setSelectedAssetIds([]);
        onSuccess();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || `Bulk ${action} failed.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || `Bulk ${action} failed.` });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // INDIVIDUAL ACTIONS
  // --------------------------------------------------------------------------

  const handleDeleteSingleAsset = async (assetId: string) => {
    if (!confirm("Remove this media asset from the archival album?")) return;

    setIsLoading(true);
    try {
      const res = await deleteMediaAssetAction(assetId, album.id);
      if (res.success) {
        onSuccess();
      } else {
        alert(res.error || "Failed to delete asset.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCover = async (url: string) => {
    setIsLoading(true);
    try {
      const res = await setAlbumCoverAction(album.id, url);
      if (res.success) {
        onSuccess();
      } else {
        alert(res.error || "Failed to update album cover.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-assets-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && !isUploading && onClose()} />

      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">{album.academicYear}</Badge>
              <h3 id="media-assets-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {album.titleEn}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Archival Media Inventory ({currentAssets.length} verified assets)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isUploading}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "gallery"
                ? "border-[var(--brand-accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Album Photos ({currentAssets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batch-upload")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "batch-upload"
                ? "border-[var(--brand-accent)] text-[var(--brand-accent)]"
                : "border-transparent text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:opacity-80"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span className="font-bold">+ Upload New Photos (Drag & Drop)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add-url")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "add-url"
                ? "border-[var(--brand-accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Add Video / External Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {statusMessage && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-[6px] text-xs ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: ASSET GALLERY GRID WITH BULK CONTROLS */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              {/* Bulk Actions Toolbar */}
              {currentAssets.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors text-2xs font-semibold"
                    >
                      {selectedAssetIds.length === currentAssets.length ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 text-[var(--brand-accent)]" /> Deselect All
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Select All ({currentAssets.length})
                        </>
                      )}
                    </button>

                    {selectedAssetIds.length > 0 && (
                      <span className="text-2xs font-medium text-[var(--text-secondary)]">
                        {selectedAssetIds.length} selected
                      </span>
                    )}
                  </div>

                  {selectedAssetIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleBulkAction("publish")}
                        className="h-7 text-2xs text-emerald-600 hover:text-emerald-700"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Publish Selected
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleBulkAction("unpublish")}
                        className="h-7 text-2xs text-amber-600 hover:text-amber-700"
                      >
                        <EyeOff className="w-3 h-3 mr-1" /> Unpublish Selected
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleBulkAction("delete")}
                        className="h-7 text-2xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Grid */}
              {currentAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentAssets.map((asset) => {
                    const isCover = album.coverImageUrl === asset.fileUrl;
                    const isSelected = selectedAssetIds.includes(asset.id);

                    return (
                      <div
                        key={asset.id}
                        className={`group relative flex flex-col rounded-[6px] border transition-all overflow-hidden ${
                          isSelected
                            ? "border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)] bg-[var(--bg-surface-elevated)]"
                            : "border-[var(--border-color)] bg-[var(--bg-surface-elevated)] shadow-xs hover:border-[var(--brand-accent)]/50"
                        }`}
                      >
                        {/* Preview */}
                        <div className="relative aspect-video bg-black/10 overflow-hidden flex items-center justify-center">
                          {asset.mediaType === "image" ? (
                            <img
                              src={asset.fileUrl}
                              alt={asset.altText || asset.captionEn || "Archival photo"}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[var(--brand-accent)] gap-1.5 p-4 text-center">
                              <Video className="w-8 h-8 stroke-[1.5]" />
                              <span className="text-2xs font-semibold text-[var(--text-primary)]">Archival Video Asset</span>
                            </div>
                          )}

                          {/* Top Controls: Selection Checkbox & Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectAsset(asset.id)}
                              className="p-1 rounded-[4px] bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs transition-colors"
                              title={isSelected ? "Deselect" : "Select for bulk action"}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-white/80" />
                              )}
                            </button>

                            <Badge variant="neutral" size="sm" className="bg-black/70 text-white backdrop-blur-xs border-transparent text-2xs">
                              {asset.mediaType === "video" ? "Video" : "Photo"}
                            </Badge>

                            {isCover && (
                              <Badge variant="accent" size="sm" className="text-2xs bg-amber-500 text-white border-transparent flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Cover
                              </Badge>
                            )}

                            {!asset.isPublished && (
                              <Badge variant="neutral" size="sm" className="text-2xs bg-neutral-800 text-neutral-300 border-transparent">
                                Unpublished
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                              {asset.captionEn || "Archival media item"}
                            </p>
                            {asset.captionAr && (
                              <p className="text-2xs text-[var(--text-secondary)] font-arabic line-clamp-1" dir="rtl">
                                {asset.captionAr}
                              </p>
                            )}
                            {asset.altText && (
                              <p className="text-2xs text-[var(--text-muted)] italic line-clamp-1 mt-0.5">
                                Alt: {asset.altText}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-2xs text-[var(--text-muted)] mt-1">
                              <span>{asset.credit ? `Photo: ${asset.credit}` : "Staff Credit"}</span>
                              <span className="font-mono">Order: #{asset.sortOrder}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2">
                              {!isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(asset.fileUrl)}
                                  disabled={isLoading}
                                  className="text-2xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-accent)] transition-colors flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" /> Make Cover
                                </button>
                              ) : (
                                <span className="text-2xs text-amber-600 font-semibold flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" /> Cover Photo
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingAsset(asset)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-2xs font-semibold text-[var(--brand-accent)] hover:border-[var(--brand-accent)]/50 transition-colors"
                                title="Edit captions and accessibility text"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Caption</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSingleAsset(asset.id)}
                                disabled={isLoading}
                                className="p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Delete media asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No Media Assets In Album"
                  description="This album is currently empty. Click the button below to upload photographs and write captions."
                  action={
                    <Button variant="accent" size="sm" onClick={() => setActiveTab("batch-upload")} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                      Upload Photos Now
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {/* TAB 2: BATCH UPLOAD WITH DRAG AND DROP & PREVIEW */}
          {activeTab === "batch-upload" && (
            <div className="space-y-5">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className={`p-8 rounded-[8px] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDragOver
                    ? "border-[var(--brand-accent)] bg-[var(--brand-accent)]/5"
                    : "border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/50 hover:border-[var(--brand-accent)]/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Drag and drop photographs or videos here
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md">
                  Supported formats: JPEG, PNG, WebP, AVIF, MP4, and WebM. File sizes up to 25MB each. Direct durable persistence to institutional storage.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 pointer-events-none"
                >
                  Browse Local Files
                </Button>
              </div>

              {/* Shared Metadata for Batch Ingestion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Default Caption (Optional)
                  </label>
                  <Input
                    value={batchCaption}
                    onChange={(e) => setBatchCaption(e.target.value)}
                    placeholder="e.g. Annual Symposium plenary session"
                  />
                  <p className="text-2xs text-[var(--text-muted)]">
                    Applied as default caption for files that lack specific descriptions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Default Photographer / Credit
                  </label>
                  <Input
                    value={batchCredit}
                    onChange={(e) => setBatchCredit(e.target.value)}
                    placeholder="e.g. Club Media Secretariat"
                  />
                  <p className="text-2xs text-[var(--text-muted)]">
                    Archival attribution recorded with each uploaded photograph.
                  </p>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-2 p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">Uploading and securing media files...</span>
                    <span className="font-mono text-[var(--brand-accent)]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-accent)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Pending Files Previews */}
              {pendingFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[var(--text-primary)]">
                      Selected Files for Upload ({pendingFiles.length})
                    </h5>
                    <button
                      type="button"
                      onClick={handleClearPendingFiles}
                      disabled={isUploading}
                      className="text-2xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className="relative rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] overflow-hidden group"
                      >
                        <div className="aspect-square bg-black/10 overflow-hidden flex items-center justify-center">
                          {item.file.type.startsWith("video/") ? (
                            <Video className="w-6 h-6 text-[var(--brand-accent)]" />
                          ) : (
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="p-1.5 text-2xs truncate">
                          <p className="font-medium text-[var(--text-primary)] truncate" title={item.file.name}>
                            {item.file.name}
                          </p>
                          <p className="text-[var(--text-muted)] font-mono">
                            {(item.file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePendingFile(item.id)}
                          disabled={isUploading}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearPendingFiles}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      isLoading={isUploading}
                      onClick={handleExecuteBatchUpload}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Upload and Register {pendingFiles.length} Assets
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SINGLE URL / EXTERNAL EMBED REGISTRATION */}
          {activeTab === "add-url" && (
            <form onSubmit={handleCreateAssetByUrl} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Media Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={urlFormData.mediaType}
                    onChange={(e) => setUrlFormData({ ...urlFormData, mediaType: e.target.value as any })}
                    className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  >
                    <option value="image">Photographic Image (URL)</option>
                    <option value="video">Archival Video (URL / Embed)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Media File URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={urlFormData.fileUrl}
                    onChange={(e) => setUrlFormData({ ...urlFormData, fileUrl: e.target.value })}
                    placeholder="/uploads/gallery/... or https://..."
                    required
                  />
                </div>
              </div>

              {urlFormData.mediaType === "video" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Archival Video Stream or Embed URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={urlFormData.videoUrl}
                    onChange={(e) => setUrlFormData({ ...urlFormData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Caption (English)
                  </label>
                  <Input
                    value={urlFormData.captionEn}
                    onChange={(e) => setUrlFormData({ ...urlFormData, captionEn: e.target.value })}
                    placeholder="e.g. Parliamentary debate final session"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Caption (Arabic)
                  </label>
                  <Input
                    value={urlFormData.captionAr}
                    onChange={(e) => setUrlFormData({ ...urlFormData, captionAr: e.target.value })}
                    placeholder="مثال: الجولة النهائية للمناظرة البرلمانية"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Alternative Text (Accessibility)
                  </label>
                  <Input
                    value={urlFormData.altText}
                    onChange={(e) => setUrlFormData({ ...urlFormData, altText: e.target.value })}
                    placeholder="e.g. Debate team holding trophy on stage"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Photographer / Credit
                  </label>
                  <Input
                    value={urlFormData.credit}
                    onChange={(e) => setUrlFormData({ ...urlFormData, credit: e.target.value })}
                    placeholder="e.g. Media Secretariat"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={urlFormData.isPublished}
                    onChange={(e) => setUrlFormData({ ...urlFormData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
                  />
                  <span>Publish Asset Immediately to Public Gallery</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("gallery")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  isLoading={isLoading}
                >
                  Save Media Asset
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* INDIVIDUAL METADATA EDIT MODAL */}
      {editingAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="fixed inset-0" onClick={() => !isLoading && setEditingAsset(null)} />
          <div className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Edit Asset Metadata & Captions
              </h4>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadataEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Caption (English)
                </label>
                <Input
                  value={editingAsset.captionEn || ""}
                  onChange={(e) => setEditingAsset({ ...editingAsset, captionEn: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Caption (Arabic)
                </label>
                <Input
                  value={editingAsset.captionAr || ""}
                  onChange={(e) => setEditingAsset({ ...editingAsset, captionAr: e.target.value })}
                  dir="rtl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Accessibility Alt Text
                </label>
                <Input
                  value={editingAsset.altText || ""}
                  onChange={(e) => setEditingAsset({ ...editingAsset, altText: e.target.value })}
                  placeholder="Descriptive text for screen readers"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Photographer / Credit
                  </label>
                  <Input
                    value={editingAsset.credit || ""}
                    onChange={(e) => setEditingAsset({ ...editingAsset, credit: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Display Sort Order
                  </label>
                  <Input
                    type="number"
                    value={editingAsset.sortOrder}
                    onChange={(e) => setEditingAsset({ ...editingAsset, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={editingAsset.isPublished}
                    onChange={(e) => setEditingAsset({ ...editingAsset, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
                  />
                  <span>Published to Public Gallery</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingAsset(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
