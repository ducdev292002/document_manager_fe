const ICONS = {
  image: { emoji: '🖼️', color: 'bg-purple-50 text-purple-600' },
  pdf: { emoji: '📕', color: 'bg-red-50 text-red-600' },
  word: { emoji: '📘', color: 'bg-blue-50 text-blue-600' },
  excel: { emoji: '📗', color: 'bg-emerald-50 text-emerald-600' },
  powerpoint: { emoji: '📙', color: 'bg-orange-50 text-orange-600' },
  text: { emoji: '📄', color: 'bg-slate-100 text-slate-600' },
  other: { emoji: '📁', color: 'bg-slate-100 text-slate-600' },
};

const FileIcon = ({ fileType, className = 'w-6 h-6' }) => {
  const { emoji, color } = ICONS[fileType] || ICONS.other;
  return (
    <span className={`inline-flex items-center justify-center rounded-lg ${color} ${className}`}>
      <span className="text-base leading-none">{emoji}</span>
    </span>
  );
};

export default FileIcon;
