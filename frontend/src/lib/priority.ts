import type { Category, Priority, PriorityAssessment, Report, Severity } from '../types';
import { CATEGORY_MAP } from './categories';

/**
 * Explainable priority scoring. This runs on the client for instant feedback and
 * is mirrored in the FastAPI backend (`app/services/priority.py`) so the same
 * reasoning can be produced server-side. It is an *estimate*: the AI never
 * verifies real-world danger.
 */

export const CATEGORY_RISK: Record<Category, number> = {
  road_damage: 72,
  garbage: 46,
  water_leak: 68,
  streetlight: 58,
  drainage: 80,
  infrastructure: 50,
};

const SEVERITY_WEIGHT: Record<Severity, number> = {
  Low: 20,
  Moderate: 45,
  Severe: 72,
  Critical: 92,
};

const SAFETY_KEYWORDS = [
  'accident',
  'injur',
  'danger',
  'child',
  'school',
  'hospital',
  'night',
  'blind',
  'open manhole',
  'electric',
  'fire',
  'flood',
  'ஆபத்து',
  'விபத்து',
  'குழந்தை',
  'மருத்துவமனை',
  'இரவு',
];

const ESSENTIAL_KEYWORDS = [
  'hospital',
  'school',
  'bus stop',
  'main road',
  'junction',
  'market',
  'temple',
  'station',
  'மருத்துவமனை',
  'பள்ளி',
  'பேருந்து',
  'சந்திப்பு',
];

export function countNearbyReports(
  report: Pick<Report, 'latitude' | 'longitude' | 'category'>,
  all: Report[],
  radiusKm = 0.75,
): number {
  return all.filter((r) => {
    if (r.latitude === report.latitude && r.longitude === report.longitude) return false;
    const dLat = (r.latitude - report.latitude) * 111;
    const dLng = (r.longitude - report.longitude) * 111 * Math.cos((report.latitude * Math.PI) / 180);
    const km = Math.sqrt(dLat * dLat + dLng * dLng);
    return km <= radiusKm && r.category === report.category;
  }).length;
}

export interface PriorityInput {
  category: Category;
  severity?: Severity;
  description?: string;
  nearbyReports?: number;
  essentialInfrastructure?: boolean;
}

export function scorePriority(input: PriorityInput): PriorityAssessment {
  const categoryWeight = CATEGORY_RISK[input.category] ?? 50;
  const severityWeight = input.severity ? SEVERITY_WEIGHT[input.severity] : 45;
  const text = (input.description ?? '').toLowerCase();
  const safetyHits = SAFETY_KEYWORDS.filter((k) => text.includes(k));
  const safetyImpact = Math.min(100, 30 + safetyHits.length * 22);
  const nearby = Math.min(input.nearbyReports ?? 0, 8);
  const essential =
    input.essentialInfrastructure ??
    ESSENTIAL_KEYWORDS.some((k) => text.includes(k));

  const score = Math.round(
    categoryWeight * 0.34 +
      severityWeight * 0.36 +
      safetyImpact * 0.14 +
      Math.min(nearby, 6) * 2.2 +
      (essential ? 7 : 0),
  );

  const clamped = Math.max(8, Math.min(100, score));
  const priority: Priority =
    clamped >= 80 ? 'Urgent' : clamped >= 62 ? 'High' : clamped >= 40 ? 'Medium' : 'Low';

  const reasons: string[] = [];
  const cat = CATEGORY_MAP[input.category];
  reasons.push(
    `${cat.label} carries a baseline public-risk weight of ${categoryWeight}/100 in the model.`,
  );
  if (input.severity) {
    reasons.push(
      `Visible severity estimated as "${input.severity}" (${severityWeight}/100 impact weight).`,
    );
  } else {
    reasons.push('No image severity estimate available; a neutral severity prior was used.');
  }
  if (nearby > 0) {
    reasons.push(
      `${nearby} other ${cat.label.toLowerCase()} report${nearby === 1 ? '' : 's'} within ~750 m — recurring issues are weighted higher.`,
    );
  } else {
    reasons.push('No similar reports nearby, so the recurrence weight is minimal.');
  }
  if (safetyHits.length) {
    reasons.push(
      `Report text mentions safety-sensitive context (${safetyHits.slice(0, 3).join(', ')}), which raises estimated public-safety impact.`,
    );
  } else {
    reasons.push('No explicit safety-sensitive keywords detected in the description.');
  }
  reasons.push(
    essential
      ? 'Location appears to serve essential infrastructure (school, hospital, transit or main road), adding a small weighting.'
      : 'No essential-infrastructure signal detected for this location.',
  );

  return {
    priority,
    score: clamped,
    reasons,
    factors: {
      categoryWeight,
      severityWeight,
      safetyImpact,
      nearbyReports: nearby,
      essentialInfrastructure: essential,
    },
  };
}

export const PRIORITY_DISCLAIMER =
  'Priority is an AI estimate based on the report content and nearby activity. It is not a verified assessment of real-world danger.';
