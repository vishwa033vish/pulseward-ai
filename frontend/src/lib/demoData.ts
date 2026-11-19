import type { AiAnalysis, Category, Priority, Report, Status } from '../types';
import { CATEGORY_MAP } from './categories';

/**
 * IMPORTANT: every report in this file is fictional sample data for the demo
 * environment (Chennai coordinates are illustrative). The UI labels these as
 * sample / demo and never claims they were sent to a real department.
 */

const DAY = 86_400_000;

function iso(daysAgo: number, hour = 10): string {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hour, Math.floor((daysAgo * 17) % 60), 0, 0);
  return d.toISOString();
}

interface Seed {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  lat: number;
  lng: number;
  area: string;
  daysAgo: number;
  department?: string;
}

const SEEDS: Seed[] = [
  {
    title: 'Deep pothole on Anna Salai service lane',
    description:
      'A large pothole roughly 2 feet wide has formed near the bus stop. Two-wheelers swerve into traffic to avoid it at night, which is dangerous for school children crossing here.',
    category: 'road_damage',
    priority: 'High',
    status: 'In Progress',
    lat: 13.0604,
    lng: 80.2496,
    area: 'Anna Salai, Teynampet',
    daysAgo: 6,
    department: 'Public Works — Roads',
  },
  {
    title: 'Garbage bins overflowing near market',
    description:
      'Three bins behind the vegetable market have not been cleared for four days. Waste is spilling onto the footpath and there is a strong smell.',
    category: 'garbage',
    priority: 'Medium',
    status: 'Assigned',
    lat: 13.0827,
    lng: 80.2707,
    area: 'Broadway Market',
    daysAgo: 3,
    department: 'Solid Waste Management',
  },
  {
    title: 'Water pipe leaking continuously',
    description:
      'A drinking water pipeline is leaking at the junction, water has been flowing for two days and the road is getting damaged.',
    category: 'water_leak',
    priority: 'High',
    status: 'Under Review',
    lat: 13.0358,
    lng: 80.2365,
    area: 'Saidapet Junction',
    daysAgo: 2,
  },
  {
    title: 'Streetlight not working on residential lane',
    description:
      'The entire lane is dark after 7pm since the pole light stopped working. Women returning from the bus stop walk in darkness.',
    category: 'streetlight',
    priority: 'High',
    status: 'Submitted',
    lat: 13.0473,
    lng: 80.2089,
    area: 'Ashok Nagar, 4th Avenue',
    daysAgo: 1,
  },
  {
    title: 'Open manhole beside school entrance',
    description:
      'The drain cover is broken and the manhole is open right outside the school gate. Children walk past it every morning — very dangerous.',
    category: 'drainage',
    priority: 'Urgent',
    status: 'Assigned',
    lat: 13.0878,
    lng: 80.2101,
    area: 'Kilpauk, near school',
    daysAgo: 4,
    department: 'Stormwater & Sewerage',
  },
  {
    title: 'Blocked storm drain causes flooding',
    description:
      'The stormwater drain is choked with silt and plastic. Even 20 minutes of rain floods the whole street knee-deep.',
    category: 'drainage',
    priority: 'Urgent',
    status: 'In Progress',
    lat: 13.0012,
    lng: 80.2565,
    area: 'Adyar, Sardar Patel Road',
    daysAgo: 8,
    department: 'Stormwater & Sewerage',
  },
  {
    title: 'Broken bus shelter roof',
    description:
      'The roof sheet of the bus shelter is hanging loose after last week’s wind. It could fall on waiting passengers.',
    category: 'infrastructure',
    priority: 'High',
    status: 'Under Review',
    lat: 13.0509,
    lng: 80.2824,
    area: 'Marina Beach bus stop',
    daysAgo: 5,
  },
  {
    title: 'Illegal dumping on empty plot',
    description:
      'Construction debris and household waste are being dumped on the vacant plot next to the park. It has become a mosquito breeding spot.',
    category: 'garbage',
    priority: 'Medium',
    status: 'Resolved',
    lat: 13.1143,
    lng: 80.1548,
    area: 'Maduravoyal',
    daysAgo: 14,
    department: 'Solid Waste Management',
  },
  {
    title: 'Road caved in after pipeline work',
    description:
      'The road was dug up for pipeline work and never restored properly. The surface has caved in and collects water.',
    category: 'road_damage',
    priority: 'High',
    status: 'Resolved',
    lat: 13.0389,
    lng: 80.2611,
    area: 'Mylapore, Kutchery Road',
    daysAgo: 21,
    department: 'Public Works — Roads',
  },
  {
    title: 'Dim streetlights on main road',
    description:
      'Streetlights from the temple to the junction are very dim. The stretch feels unsafe after 9pm.',
    category: 'streetlight',
    priority: 'Medium',
    status: 'In Progress',
    lat: 13.0339,
    lng: 80.2696,
    area: 'Triplicane High Road',
    daysAgo: 9,
    department: 'Electrical & Lighting',
  },
  {
    title: 'Sewage overflow onto footpath',
    description:
      'Sewage is overflowing from the chamber and flowing across the footpath in front of the clinic. Strong odour and health risk.',
    category: 'drainage',
    priority: 'Urgent',
    status: 'Submitted',
    lat: 13.0708,
    lng: 80.2425,
    area: 'Nungambakkam, Haddows Road',
    daysAgo: 0,
  },
  {
    title: 'Pothole cluster on Velachery main road',
    description:
      'A series of potholes across the left lane near the flyover. Traffic slows down abruptly and two-wheelers are at risk.',
    category: 'road_damage',
    priority: 'High',
    status: 'Assigned',
    lat: 12.9815,
    lng: 80.218,
    area: 'Velachery, near flyover',
    daysAgo: 7,
    department: 'Public Works — Roads',
  },
  {
    title: 'Public tap running continuously',
    description:
      'A public tap near the park has been running non-stop for three days. Lots of drinking water is being wasted.',
    category: 'water_leak',
    priority: 'Medium',
    status: 'Resolved',
    lat: 13.0264,
    lng: 80.2198,
    area: 'Ekkatuthangal',
    daysAgo: 17,
    department: 'Water Supply Board',
  },
  {
    title: 'Graffiti and damaged park bench',
    description:
      'Park benches are broken and the compound wall has been damaged. The park is used by elderly residents every morning.',
    category: 'infrastructure',
    priority: 'Low',
    status: 'Submitted',
    lat: 13.0669,
    lng: 80.2766,
    area: 'Egmore, park side',
    daysAgo: 11,
  },
];

function analysisFor(seed: Seed): AiAnalysis {
  const cat = CATEGORY_MAP[seed.category];
  const severity =
    seed.priority === 'Urgent'
      ? 'Critical'
      : seed.priority === 'High'
        ? 'Severe'
        : seed.priority === 'Medium'
          ? 'Moderate'
          : 'Low';
  return {
    category: seed.category,
    description: seed.description,
    evidence: [
      `Visible ${cat.label.toLowerCase()} pattern consistent with the report description`,
      'Surrounding civic context visible in the frame',
      'Surface condition appears degraded compared to an intact baseline',
    ],
    severity: severity as AiAnalysis['severity'],
    suggestedPriority: seed.priority,
    recommendedAction: `Route to ${cat.department} for an on-site inspection.`,
    confidence: 0.58,
    isEstimate: true,
    source: { engine: 'demo', model: 'seed-data' },
    disclaimer: 'Sample analysis stored with the demo dataset. Not a real-world verified assessment.',
    createdAt: iso(seed.daysAgo),
  };
}

const STATUS_FLOW: Status[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

function historyFor(seed: Seed): Report['status_history'] {
  const end = STATUS_FLOW.indexOf(seed.status);
  const start = iso(seed.daysAgo);
  return STATUS_FLOW.slice(0, end + 1).map((status, i) => ({
    status,
    at: new Date(new Date(start).getTime() + i * 1.6 * DAY).toISOString(),
    note: i === 0 ? 'Report created in demo environment' : 'Demo status update',
  }));
}

export const SAMPLE_REPORTS: Report[] = SEEDS.map((seed, index) => {
  const created = iso(seed.daysAgo);
  return {
    id: `demo-${String(index + 1).padStart(4, '0')}-${seed.category.slice(0, 3)}`,
    user_id: index % 3 === 0 ? 'demo-citizen' : `demo-resident-${(index % 4) + 1}`,
    author_name: ['Aarav Raj', 'Meena S.', 'Karthik V.', 'Divya R.', 'Suresh K.'][index % 5],
    title: seed.title,
    description: seed.description,
    category: seed.category,
    priority: seed.priority,
    priority_score: seed.priority === 'Urgent' ? 88 : seed.priority === 'High' ? 71 : seed.priority === 'Medium' ? 52 : 28,
    priority_reasons: [
      'Sample priority assigned with the demo dataset.',
      'Uses the same explainable scoring model as live reports.',
    ],
    status: seed.status,
    latitude: seed.lat,
    longitude: seed.lng,
    area: seed.area,
    image_url: null,
    ai_analysis: analysisFor(seed),
    department: seed.department ?? null,
    is_sample: true,
    created_at: created,
    updated_at: historyFor(seed).at(-1)!.at,
    status_history: historyFor(seed),
  };
});
