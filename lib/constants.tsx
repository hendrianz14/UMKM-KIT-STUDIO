
import React from 'react';

// Common props for all icons to ensure consistency
const commonProps = {
  strokeWidth: "1.5",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const GenerateIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
    <path d="M12 22v-6" />
    <path d="M8.46 16.54L12 13l3.54 3.54" />
  </svg>
);

export const GalleryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const EditorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const TextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const BugIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M20 8h-4.82c-.3-.62-.68-1.2-1.12-1.72L16 4.46 14.54 3 12 5.54 9.46 3 8 4.46l1.94 1.82C9.5 6.8 9.12 7.38 8.82 8H4v2h1.18c.05.65.18 1.28.37 1.88L4 13.62V15h2.38l.68.68c.5.52 1.06.96 1.66 1.32H4v2h5.18c.3.62.68 1.2 1.12 1.72L8 22.54 9.46 24 12 21.46 14.54 24 16 22.54l-1.94-1.82c.44-.52.82-1.1 1.12-1.72H20v-2h-1.18c-.05-.65-.18-1.28-.37-1.88L20 13.38V12h-2.38l-.68-.68c-.5-.52-1.06-.96-1.66-1.32H20V8z" />
  </svg>
);

export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.74 5.57 4.14 6.64A2 2 0 0 1 10 17v1" />
    <path d="M12 2a7 7 0 0 1 7 7c0 3.03-1.74 5.57-4.14 6.64A2 2 0 0 0 14 17v1" />
  </svg>
);

export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);

export const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...commonProps} viewBox="0 0 24 24" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...props}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    <path d="M15 21a1 1 0 01-1-1v-2a1 1 0 012 0v2a1 1 0 01-1 1zM6.049 14.927c.3-.921 1.603-.921 1.902 0l.535 1.646a1 1 0 00.95.69h1.73c.969 0 1.371 1.24.588 1.81l-1.4 1.017a1 1 0 00-.364 1.118l.535 1.646c.3.921-.755 1.688-1.54 1.118l-1.4-1.017a1 1 0 00-1.175 0l-1.4 1.017c-.784.57-1.838-.197-1.539-1.118l.535-1.646a1 1 0 00-.364-1.118l-1.4-1.017c-.783-.57-.38-1.81.588-1.81h1.73a1 1 0 00.951-.69l.535-1.646z" />
  </svg>
);

export const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </svg>
);

export const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...commonProps} viewBox="0 0 24 24" {...props}>
        <path d="M14.5 12.5L18 9l-1.5-1.5L14 10l-2-2-6 6h3l2-2 2 2z" />
        <circle cx="7.5" cy="16.5" r="2.5" />
    </svg>
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...commonProps} viewBox="0 0 24 24" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const CreditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...commonProps} viewBox="0 0 24 24" {...props}>
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
        <circle cx="15" cy="12" r="2" />
        <path d="M5 6V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
    </svg>
);
