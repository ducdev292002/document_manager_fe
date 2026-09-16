export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// Forces Cloudinary to send Content-Disposition: attachment with the
// document's real display name instead of its internal (random) public_id.
export const buildDownloadUrl = (doc) => {
  const safeName = doc.displayName?.replace(/[^\w.\- ]+/g, '_') || 'download';
  const separator = doc.url.includes('?') ? '&' : '?';
  return `${doc.url}${separator}fl_attachment=${encodeURIComponent(safeName)}`;
};

// Word/Excel/PowerPoint have no native browser preview, so we embed
// Microsoft's free public viewer - it just needs a publicly reachable URL,
// which Cloudinary's delivery URLs already are.
const OFFICE_PREVIEW_TYPES = ['word', 'excel', 'powerpoint'];
export const canOfficePreview = (fileType) => OFFICE_PREVIEW_TYPES.includes(fileType);
export const buildOfficePreviewUrl = (url) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
