import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import { Link } from 'react-router-dom';
import { CATEGORY_MAP } from '../lib/categories';
import { shortId, timeAgo } from '../lib/format';
import type { Report } from '../types';
import { formatCoords } from '../lib/format';

export const CHENNAI_CENTER: [number, number] = [13.055, 80.245];

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function markerIcon(report: Report, selected: boolean) {
  const color = CATEGORY_MAP[report.category].color;
  const size = selected ? 42 : 30;
  const border = selected ? '#ffffff' : 'rgba(255,255,255,0.55)';
  return L.divIcon({
    className: 'pulseward-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div class="pulse-marker" style="width:${size}px;height:${size}px">
        ${
          report.priority === 'Urgent' && report.status !== 'Resolved'
            ? `<span class="pulse-marker__ring" style="border:2px solid ${color};"></span>`
            : ''
        }
        <span style="
          display:grid;place-items:center;width:${size}px;height:${size}px;
          border-radius:999px;background:${color}22;border:2px solid ${border};
          box-shadow:0 0 0 4px ${color}18, 0 8px 20px -6px rgba(0,0,0,0.8);
        ">
          <span style="width:${Math.max(6, size * 0.3)}px;height:${Math.max(6, size * 0.3)}px;border-radius:999px;background:${color};box-shadow:0 0 10px ${color};"></span>
        </span>
      </div>`,
  });
}

function clusterIcon(count: number) {
  const size = count > 9 ? 50 : 42;
  return L.divIcon({
    className: 'pulseward-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:999px;
      background:radial-gradient(circle at 30% 25%, rgba(34,211,238,0.45), rgba(56,189,248,0.12));
      border:1px solid rgba(34,211,238,0.6);color:#eaf6ff;font-family:Inter,sans-serif;
      font-size:13px;font-weight:600;box-shadow:0 0 0 6px rgba(34,211,238,0.08);
    ">${count}</div>`,
  });
}

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
}

function LocationClickCatcher({
  onPick,
  onZoom,
}: {
  onPick: (next: { lat: number; lng: number }) => void;
  onZoom: (z: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    zoomend(e) {
      onZoom(e.target.getZoom());
    },
  });
  return null;
}

function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();
  useMemo(() => {
    if (!reports.length) return;
    const bounds = reports.map((r) => [r.latitude, r.longitude]) as LatLngBoundsExpression;
    try {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } catch {
      /* ignore */
    }
  }, [reports.length]);
  return null;
}

export interface MapViewProps {
  reports: Report[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: string;
  showLegend?: boolean;
  fitOnLoad?: boolean;
  onMapReady?: (map: L.Map) => void;
}

export function MapView({
  reports,
  selectedId,
  onSelect,
  height = '560px',
  showLegend = true,
  fitOnLoad = false,
  onMapReady,
}: MapViewProps) {
  const [zoom, setZoom] = useState(11);

  const markers = useMemo(() => {
    // Simple grid clustering: cell size shrinks as the user zooms in.
    const cell = 0.32 / Math.pow(1.55, Math.max(0, zoom - 10));
    const buckets = new Map<string, Report[]>();
    for (const r of reports) {
      const key = `${Math.round(r.latitude / cell)}:${Math.round(r.longitude / cell)}`;
      const arr = buckets.get(key) ?? [];
      arr.push(r);
      buckets.set(key, arr);
    }
    const out: Array<{ kind: 'single'; report: Report } | { kind: 'cluster'; items: Report[]; lat: number; lng: number }> = [];
    buckets.forEach((items) => {
      if (items.length === 1 || zoom >= 14) {
        items.forEach((report) => out.push({ kind: 'single', report }));
      } else {
        out.push({
          kind: 'cluster',
          items,
          lat: items.reduce((s, r) => s + r.latitude, 0) / items.length,
          lng: items.reduce((s, r) => s + r.longitude, 0) / items.length,
        });
      }
    });
    return out;
  }, [reports, zoom]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]" style={{ height }}>
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={11}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
        {onMapReady && <MapReady onReady={onMapReady} />}
        <ZoomWatcher onZoom={setZoom} />
        {fitOnLoad && <FitBounds reports={reports} />}

        {markers.map((m, idx) => {
          if (m.kind === 'cluster') {
            return (
              <Marker
                key={`cluster-${m.lat}-${m.lng}-${idx}`}
                position={[m.lat, m.lng]}
                icon={clusterIcon(m.items.length)}
                eventHandlers={{
                  click: (e) => e.target._map?.setView([m.lat, m.lng], Math.min(16, zoom + 2)),
                }}
              >
                <Popup>
                  <strong>{m.items.length} reports in this area</strong>
                  <div className="mt-1 text-[11px] opacity-80">Zoom in for individual reports.</div>
                </Popup>
              </Marker>
            );
          }
          const report = m.report;
          const meta = CATEGORY_MAP[report.category];
          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={markerIcon(report, selectedId === report.id)}
              eventHandlers={{ click: () => onSelect?.(report.id) }}
              zIndexOffset={selectedId === report.id ? 1000 : 0}
            >
              <Popup>
                <div className="w-[230px]">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </div>
                  <p className="font-display text-[13px] font-semibold leading-snug text-white">{report.title}</p>
                  <p className="mt-1 text-[11px] text-ink-400">{report.area}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[10px]">{report.priority}</span>
                    <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[10px]">{report.status}</span>
                    <span className="text-[10px] opacity-70">#{shortId(report.id)}</span>
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] opacity-60">{formatCoords(report.latitude, report.longitude)}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="opacity-60">{timeAgo(report.created_at)}</span>
                    <Link to={`/app/tracking/${report.id}`} className="font-semibold text-pulse-sky">
                      Open report →
                    </Link>
                  </div>
                  {report.is_sample && (
                    <div className="mt-2 rounded border border-amber-300/25 bg-amber-300/10 px-1.5 py-1 text-[9px] uppercase tracking-wider text-amber-200">
                      Sample data
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {showLegend && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] hidden rounded-xl border border-white/10 bg-midnight-950/85 p-3 backdrop-blur-md sm:block">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
            Category legend
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.values(CATEGORY_MAP).map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 text-[10px] text-ink-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                {c.short}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Click-to-pick location map used by the report composer. */
export function LocationPicker({
  value,
  onChange,
  height = '280px',
}: {
  value: { lat: number; lng: number } | null;
  onChange: (next: { lat: number; lng: number }) => void;
  height?: string;
}) {
  const [zoom, setZoom] = useState(13);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10" style={{ height }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : CHENNAI_CENTER}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <LocationClickCatcher onPick={onChange} onZoom={setZoom} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={L.divIcon({
              className: 'pick-marker',
              iconSize: [26, 26],
              iconAnchor: [13, 13],
              html: `<div style="width:26px;height:26px;border-radius:999px;background:rgba(34,211,238,0.25);border:2px solid #22D3EE;box-shadow:0 0 0 6px rgba(34,211,238,0.12);display:grid;place-items:center"><div style="width:6px;height:6px;border-radius:999px;background:#22D3EE"></div></div>`,
            })}
          />
        )}
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg border border-white/10 bg-midnight-950/85 px-2 py-1 text-[10px] text-ink-300 backdrop-blur">
        Click the map to set the exact location
      </div>
    </div>
  );
}
