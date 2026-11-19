import type { Category, Department, Priority, Status } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  labelTa: string;
  short: string;
  color: string;
  soft: string;
  department: string;
  description: string;
  keywords: string[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'road_damage',
    label: 'Road Damage',
    labelTa: 'சாலை சேதம்',
    short: 'Roads',
    color: '#F59E0B',
    soft: 'rgba(245,158,11,0.14)',
    department: 'Public Works — Roads',
    description: 'Potholes, cracks, broken footpaths and surface depressions.',
    keywords: ['pothole', 'road', 'crack', 'asphalt', 'footpath', 'street', 'சாலை', 'பள்ளம்'],
  },
  {
    id: 'garbage',
    label: 'Garbage',
    labelTa: 'குப்பை',
    short: 'Waste',
    color: '#34D399',
    soft: 'rgba(52,211,153,0.14)',
    department: 'Solid Waste Management',
    description: 'Overflowing bins, dumped waste and uncollected garbage.',
    keywords: ['garbage', 'waste', 'trash', 'dump', 'bin', 'litter', 'குப்பை', 'கழிவு'],
  },
  {
    id: 'water_leak',
    label: 'Water Leakage',
    labelTa: 'நீர் கசிவு',
    short: 'Water',
    color: '#38BDF8',
    soft: 'rgba(56,189,248,0.14)',
    department: 'Water Supply Board',
    description: 'Leaking pipes, burst mains and continuous water loss.',
    keywords: ['water', 'leak', 'pipe', 'burst', 'tap', 'நீர்', 'கசிவு', 'குழாய்'],
  },
  {
    id: 'streetlight',
    label: 'Streetlight',
    labelTa: 'தெரு விளக்கு',
    short: 'Lights',
    color: '#A78BFA',
    soft: 'rgba(167,139,250,0.14)',
    department: 'Electrical & Lighting',
    description: 'Dark streetlights, broken poles and faulty fixtures.',
    keywords: ['light', 'lamp', 'streetlight', 'dark', 'pole', 'விளக்கு', 'இருள்'],
  },
  {
    id: 'drainage',
    label: 'Drainage',
    labelTa: 'வடிகால்',
    short: 'Drainage',
    color: '#2DD4BF',
    soft: 'rgba(45,212,191,0.14)',
    department: 'Stormwater & Sewerage',
    description: 'Blocked drains, open manholes and sewage overflow.',
    keywords: ['drain', 'sewer', 'manhole', 'flood', 'blockage', 'வடிகால்', 'கழிவுநீர்'],
  },
  {
    id: 'infrastructure',
    label: 'Public Infrastructure',
    labelTa: 'பொது உட்கட்டமைப்பு',
    short: 'Infra',
    color: '#F472B6',
    soft: 'rgba(244,114,182,0.14)',
    department: 'Municipal Infrastructure',
    description: 'Damaged public property, benches, walls and signage.',
    keywords: ['bench', 'wall', 'bridge', 'sign', 'park', 'structure', 'உட்கட்டமைப்பு'],
  },
];

export const CATEGORY_MAP: Record<Category, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<Category, CategoryMeta>,
);

export const STATUSES: Status[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const STATUS_STYLE: Record<Status, { color: string; bg: string; border: string; dot: string }> = {
  Submitted: {
    color: '#93C5FD',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(96,165,250,0.28)',
    dot: '#60A5FA',
  },
  'Under Review': {
    color: '#FDE68A',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    dot: '#FBBF24',
  },
  Assigned: {
    color: '#C4B5FD',
    bg: 'rgba(139,92,246,0.14)',
    border: 'rgba(167,139,250,0.3)',
    dot: '#A78BFA',
  },
  'In Progress': {
    color: '#67E8F9',
    bg: 'rgba(34,211,238,0.12)',
    border: 'rgba(34,211,238,0.3)',
    dot: '#22D3EE',
  },
  Resolved: {
    color: '#86EFAC',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(74,222,128,0.28)',
    dot: '#4ADE80',
  },
};

export const PRIORITY_STYLE: Record<Priority, { color: string; bg: string; border: string }> = {
  Low: { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.28)' },
  Medium: { color: '#7DD3FC', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
  High: { color: '#FDBA74', bg: 'rgba(249,115,22,0.13)', border: 'rgba(249,115,22,0.32)' },
  Urgent: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.14)', border: 'rgba(248,113,113,0.34)' },
};

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-roads',
    department_name: 'Public Works — Roads',
    description: 'Road surface repair, potholes and footpaths.',
  },
  {
    id: 'dept-waste',
    department_name: 'Solid Waste Management',
    description: 'Garbage collection, bins and dumping sites.',
  },
  {
    id: 'dept-water',
    department_name: 'Water Supply Board',
    description: 'Pipeline leaks, supply and public taps.',
  },
  {
    id: 'dept-lighting',
    department_name: 'Electrical & Lighting',
    description: 'Streetlights, poles and electrical safety.',
  },
  {
    id: 'dept-stormwater',
    department_name: 'Stormwater & Sewerage',
    description: 'Drains, manholes and sewage overflow.',
  },
  {
    id: 'dept-infra',
    department_name: 'Municipal Infrastructure',
    description: 'Public structures, signage and civic assets.',
  },
];

export const priorityOrder: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
