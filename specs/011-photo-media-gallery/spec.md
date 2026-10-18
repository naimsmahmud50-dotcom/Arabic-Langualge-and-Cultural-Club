# SPECIFICATION: 011 - Photo & Media Gallery and Archive System

## 1. Overview & Objective
Implement and verify a prestigious, fully accessible Photo & Media Archive for the Arabic Language & Cultural Club:
1. **Gallery Overview (`/gallery`):** Category-filtered, searchable catalog of curated archival albums documenting academic symposia, calligraphy exhibitions, debate championships, cultural soirees, and manuscript workshops.
2. **Event-Linked Albums:** Cross-linking gallery albums with official club events (`/events/[slug]`), enabling students and scholars to explore photographic records alongside the official event dossier.
3. **Album Dossier & Media Grid (`/gallery/[slug]`):** High-fidelity responsive photo and video asset grid, bilingual captions (English + Arabic), photographer credits, verified dates, and academic year attribution.
4. **Interactive Accessible Lightbox:** Touch- and keyboard-navigable media viewer with full accessibility (`Esc` to close, `ArrowLeft` / `ArrowRight` navigation, focus trapping, screen-reader announcements, video player support, and counter display).
5. **Media Storage Security & Privacy Safeguards:** Secure file validation utility (JPEG, PNG, WebP, AVIF, MP4, size limits), path traversal prevention, zero client credential exposure, and member privacy consent enforcement.

---

## 2. User Stories

### Story 1: Archival Album Explorer (Student & Academic Visitor)
- **As a** visitor, student, or faculty member,
- **I want to** browse photographic and audiovisual records filtered by category (Symposia, Calligraphy, Debates, Workshops, Ceremonies) and academic year,
- **So that** I can review the club's intellectual and cultural heritage.

### Story 2: Event Cross-Referencing
- **As a** participant or researcher visiting an album,
- **I want to** see if the album was part of an official club event with a direct link to the event dossier,
- **So that** I can view the original agenda, speaker lineup, and symposium context.

### Story 3: High-Fidelity Lightbox & Bilingual Media Inspection
- **As a** calligraphy student or art enthusiast,
- **I want to** inspect high-resolution photographs and video excerpts in a full-screen, distraction-free lightbox with bilingual Arabic and English explanatory notes and photographer attributions,
- **So that** I can appreciate the artwork and cultural moments with scholarly depth.

### Story 4: Accessibility & Keyboard Control
- **As a** user relying on keyboard navigation or assistive technology,
- **I want to** open, cycle through, and dismiss media items using standard keys (`Enter`, `Esc`, `ArrowLeft`, `ArrowRight`),
- **So that** the media archive is completely accessible without mouse interaction.

### Story 5: Security & Privacy Compliance
- **As an** institutional curator or compliance officer,
- **I want to** ensure only authorized, consent-cleared, and published media are visible publicly, while draft assets remain strictly invisible to unauthenticated visitors,
- **So that** student privacy and institutional reputations are rigorously safeguarded.

---

## 3. Acceptance Criteria

### Gallery Overview (`/gallery`)
- **AC-GAL-01:** `/gallery` renders published albums sorted by event date in descending order.
- **AC-GAL-02:** Category pills (`All`, `Symposia`, `Debates`, `Calligraphy`, `Workshops`, `Ceremonies`) filter albums reactively or via query parameters.
- **AC-GAL-03:** Academic year selector filters albums by session (e.g. `2024–2025`, `2023–2024`).
- **AC-GAL-04:** Keyword search filters albums by English title, Arabic title, description, or location.
- **AC-GAL-05:** Each album card renders cover image, academic year badge, verified date/location, photographer credit (if available), photo/video count indicator, and link to album detail.
- **AC-GAL-06:** An institutional empty state renders gracefully when no albums match the selected filters or search terms.

### Album Detail & Lightbox (`/gallery/[slug]`)
- **AC-GAL-07:** `/gallery/[slug]` displays the album headline (English + Arabic), archival description, date, academic year, photographer attribution, and event banner (if linked to an event).
- **AC-GAL-08:** Displays a responsive media grid of all published photographs and videos. Video items render a distinct badge and play icon.
- **AC-GAL-09:** Clicking any media item opens the interactive accessible lightbox, focusing the selected image/video and locking background scroll.
- **AC-GAL-10:** Lightbox supports keyboard shortcuts: `Esc` to close, `ArrowRight` for next media, `ArrowLeft` for previous media.
- **AC-GAL-11:** Lightbox displays current index counter (e.g., `3 of 8`), bilingual caption, photographer credit, and download/fullscreen action.
- **AC-GAL-12:** Video media items embed an accessible HTML5 `<video>` player or verified streaming embed.
- **AC-GAL-13:** Non-existent or unpublished albums (`isPublished = false`) return a clean `404 Not Found` response via `notFound()`.
- **AC-GAL-14:** `generateMetadata({ params })` generates accurate dynamic `<title>`, `<meta description>`, and OpenGraph tags for search engines and social cards.

### Media Storage & Security Engine
- **AC-GAL-15:** Media storage validator rejects unpermitted MIME types (permits only `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`).
- **AC-GAL-16:** Enforces maximum upload sizes (15 MB for images, 100 MB for video).
- **AC-GAL-17:** Path sanitization strictly prevents directory traversal attacks (e.g., stripping `..`, slashes, null bytes).
- **AC-GAL-18:** Zero cloud storage secret credentials or write SAS tokens are ever exposed in client components or public API responses.

---

## 4. Visual Identity & Editorial Tone
- **Strictly No AI Emojis:** Use clean, academic Lucide SVG icons (`Camera`, `Film`, `Calendar`, `MapPin`, `User`, `ArrowRight`, `ArrowLeft`, `Maximize2`, `X`).
- **Heritage Colors:** Primary Forest Green (`#173D32`), Warm Sand (`#F5F0E5`), Gold Accent (`#B18A4A`), Dark Obsidian (`#17211D`), and Subtle Sage borders.
- **Bilingual Arabic Shaping:** Seamless RTL support for Arabic captions and headlines with Tajawal / Noto Naskh font family.
- **Developer Documentation:** Every modified file must include detailed top-of-file JSDoc headers explaining route, component role, security precautions, and guidance for new developers.
