const ICONS = {
  image: { emoji: '🖼️', color: 'bg-purple-100 text-purple-600' },
  pdf: { emoji: '📕', color: 'bg-red-100 text-red-600' },
  word: { emoji: '📘', color: 'bg-blue-100 text-blue-600' },
  excel: { emoji: '📗', color: 'bg-green-100 text-green-600' },
  powerpoint: { emoji: '📙', color: 'bg-orange-100 text-orange-600' },
  text: { emoji: '📄', color: 'bg-slate-100 text-slate-600' },
  other: { emoji: '📁', color: 'bg-slate-100 text-slate-600' },
};

const FileIcon = ({ fileType, className = 'w-6 h-6' }) => {
  const { emoji, color } = ICONS[fileType] || ICONS.other;
  return (
    <span className={`inline-flex items-center justify-center rounded ${color} ${className}`}>
      <span className="text-base leading-none">{emoji}</span>
    </span>
  );
};

export default FileIcon;
