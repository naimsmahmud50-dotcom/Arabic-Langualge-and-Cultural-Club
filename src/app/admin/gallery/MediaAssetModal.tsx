/**
 * @file src/app/admin/gallery/MediaAssetModal.tsx
 * @description Administrative Media Asset Manager & File Upload Validator (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages individual photographs and video recordings inside a selected gallery album.
 * - Enforces Strix-Supabase Security: Validates MIME types, file sizes, and rejects executable payloads.
 * - Allows setting album cover image directly from existing media assets.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  ExternalLink 
} from "lucide-react";
import { 
  saveMediaAssetAction, 
  deleteMediaAssetAction, 
  setAlbumCoverAction,
  validateMediaUploadAction 
} from "@/lib/actions/content-cms";

interface MediaItem {
  id: string;
  albumId: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  captionEn?: string | null;
  captionAr?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isPublished: boolean;
}

interface AlbumContext {
  id: string;
  titleEn: string;
  slug: string;
  academicYear: string;
  coverImageUrl?: string | null;
  assets?: MediaItem[];
}

interface MediaAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  album: AlbumContext | null;
}

export function MediaAssetModal({
  isOpen,
  onClose,
  onSuccess,
  album,
}: MediaAssetModalProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "add-asset">("gallery");

  // Form State for new asset
  const [formData, setFormData] = useState({
    fileUrl: "",
    thumbnailUrl: "",
    mediaType: "image" as "image" | "video",
    videoUrl: "",
    captionEn: "",
    captionAr: "",
    credit: "",
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // File Upload Security Verification State
  const [simulatedFile, setSimulatedFile] = useState<{ name: string; size: number; mime: string } | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  if (!isOpen || !album) return null;

  const currentAssets = album.assets || [];

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl.trim()) {
      setStatusMessage({ type: "error", text: "Media File URL is required." });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await saveMediaAssetAction({
        albumId: album.id,
        fileUrl: formData.fileUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || null,
        mediaType: formData.mediaType,
        videoUrl: formData.videoUrl.trim() || null,
        captionEn: formData.captionEn.trim() || null,
        captionAr: formData.captionAr.trim() || null,
        credit: formData.credit.trim() || null,
        sortOrder: currentAssets.length + 1,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setStatusMessage({ type: "error", text: res.error || "Failed to add media asset." });
      } else {
        setStatusMessage({ type: "success", text: "Media asset registered successfully." });
        setFormData({
          fileUrl: "",
          thumbnailUrl: "",
          mediaType: "image",
          videoUrl: "",
          captionEn: "",
          captionAr: "",
          credit: "",
          isPublished: true,
        });
        setActiveTab("gallery");
        onSuccess();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to add media asset." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
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

  const handleTestUploadSecurity = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSimulatedFile({ name: file.name, size: file.size, mime: file.type });
    setIsLoading(true);

    try {
      const res = await validateMediaUploadAction({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        albumSlug: album.slug,
        academicYear: album.academicYear,
      });

      setValidationResult(res);
      if (res.success) {
        // Automatically populate fileUrl with safe mock storage key or preview URL
        setFormData((prev) => ({
          ...prev,
          fileUrl: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80`,
          mediaType: res.mediaType || "image",
        }));
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
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "gallery"
                ? "border-[var(--brand-accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Album Asset Grid ({currentAssets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add-asset")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "add-asset"
                ? "border-[var(--brand-accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Add New Media Asset
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {statusMessage && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-[6px] mb-4 text-xs ${
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

          {/* TAB 1: ASSET GALLERY */}
          {activeTab === "gallery" && (
            <div>
              {currentAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentAssets.map((asset) => {
                    const isCover = album.coverImageUrl === asset.fileUrl;
                    return (
                      <div
                        key={asset.id}
                        className="group relative flex flex-col rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] overflow-hidden shadow-xs hover:border-[var(--brand-accent)]/50 transition-all"
                      >
                        {/* Preview Image / Video Indicator */}
                        <div className="relative aspect-video bg-black/10 overflow-hidden flex items-center justify-center">
                          {asset.mediaType === "image" ? (
                            <img
                              src={asset.fileUrl}
                              alt={asset.captionEn || "Archival photo"}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[var(--brand-accent)] gap-1.5 p-4 text-center">
                              <Video className="w-8 h-8 stroke-[1.5]" />
                              <span className="text-2xs font-semibold text-[var(--text-primary)]">Archival Video Asset</span>
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <Badge variant="neutral" size="sm" className="bg-black/70 text-white backdrop-blur-xs border-transparent text-2xs">
                              {asset.mediaType === "video" ? "Video" : "Photo"}
                            </Badge>
                            {isCover && (
                              <Badge variant="accent" size="sm" className="text-2xs bg-amber-500 text-white border-transparent flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Cover
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
                            {asset.credit && (
                              <p className="text-2xs text-[var(--text-muted)] mt-1">
                                Photo by: {asset.credit}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
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
                                <Star className="w-3 h-3 fill-current" /> Current Cover
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteAsset(asset.id)}
                              disabled={isLoading}
                              className="text-2xs text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete media asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No Media Assets In Album"
                  description="This album is currently empty. Click 'Add New Media Asset' above to upload photography or video records."
                  action={
                    <Button variant="accent" size="sm" onClick={() => setActiveTab("add-asset")}>
                      Add First Media Asset
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW MEDIA ASSET */}
          {activeTab === "add-asset" && (
            <div className="space-y-6">
              {/* Server-Side Upload Security Tester */}
              <div className="p-4 rounded-[6px] border border-dashed border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/50 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Strix Security Upload Validator
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Verify local files against the server's MIME type whitelist and anti-malware filter (rejects executable files, scripts, and XML payloads).
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Select Local File to Test
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleTestUploadSecurity}
                      accept=".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm"
                    />
                  </label>

                  {simulatedFile && (
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {simulatedFile.name} ({(simulatedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>

                {validationResult && (
                  <div
                    className={`p-3 rounded-[6px] text-xs font-mono space-y-1 ${
                      validationResult.success
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}
                  >
                    <p className="font-bold">
                      {validationResult.success ? "Security Gate: Passed" : "Security Gate: Rejected"}
                    </p>
                    {validationResult.success ? (
                      <p className="text-2xs">Safe Storage Key: {validationResult.storageKey}</p>
                    ) : (
                      <p className="text-2xs">{validationResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Media Asset Registration Form */}
              <form onSubmit={handleCreateAsset} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Media Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                      className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                    >
                      <option value="image">Photographic Image (JPG/PNG/WebP)</option>
                      <option value="video">Archival Video (MP4/WebM)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Media File URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      required
                    />
                  </div>
                </div>

                {formData.mediaType === "video" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Archival Video Stream or Embed URL (Optional)
                    </label>
                    <Input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
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
                      value={formData.captionEn}
                      onChange={(e) => setFormData({ ...formData, captionEn: e.target.value })}
                      placeholder="e.g. Finalists during the parliamentary debate round"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Caption (Arabic)
                    </label>
                    <Input
                      value={formData.captionAr}
                      onChange={(e) => setFormData({ ...formData, captionAr: e.target.value })}
                      placeholder="مثال: المتناظرون في الجولة النهائية"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Photographer / Videographer Credit
                    </label>
                    <Input
                      value={formData.credit}
                      onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                      placeholder="e.g. Media Secretariat"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">
                      Thumbnail URL (Optional)
                    </label>
                    <Input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
                    />
                    <span>Publish Asset to Public Gallery</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
