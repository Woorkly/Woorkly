import { useState } from "react";
import "./dbAdmin.css";

// ── Données ──────────────────────────────────────────────
const kpis = [
  { label: "Salles Total", value: "12", unit: "Salles", delta: "+15%", color: "blue" },
  { label: "Réservations Aujourd'hui", value: "48", unit: "Réservations", delta: "+22%", color: "teal" },
  { label: "Utilisateurs Actifs", value: "256", unit: "Utilisateurs", delta: "+8%", color: "blue" },
  { label: "Taux d'Occupation", value: "78.5%", unit: "", delta: "+10%", color: "green" },
];

const monthlyData = [
  { month: "Jan", total: 350, confirmed: 200 },
  { month: "Fév", total: 450, confirmed: 280 },
  { month: "Mar", total: 350, confirmed: 220 },
  { month: "Avr", total: 450, confirmed: 300 },
  { month: "Mai", total: 460, confirmed: 310 },
  { month: "Jun", total: 670, confirmed: 420 },
  { month: "Jul", total: 680, confirmed: 450 },
  { month: "Aoû", total: 790, confirmed: 530 },
  { month: "Sep", total: 610, confirmed: 400 },
  { month: "Oct", total: 840, confirmed: 600 },
];

const usageData = [
  { label: "Réunions Équipe", percent: 45, color: "#1A56A0" },
  { label: "Visioconférences", percent: 25, color: "#38BDF8" },
  { label: "Présentations", percent: 15, color: "#10B981" },
  { label: "Ateliers", percent: 10, color: "#F59E0B" },
  { label: "Autre", percent: 5, color: "#94a3b8" },
];

const lastReservations = [
  { date: "Oct 15 14:00", salle: "Innovation Hub", utilisateur: "Sarah Dupont", statut: "Confirmé" },
  { date: "Oct 15 11:30", salle: "Boardroom A", utilisateur: "Marc Lemoine", statut: "En attente" },
  { date: "Oct 15 11:30", salle: "Boardroom A", utilisateur: "Marc Lemoine", statut: "Annulé" },
  { date: "Oct 15 14:00", salle: "Innovation Hub", utilisateur: "Sarah Dupont", statut: "Confirmé" },
];

// ── Graphique area ────────────────────────────────────────
function AreaChart({ data }) {
  const w = 800;
  const h = 340;
  const padL = 50;
  const padR = 20;
  const padB = 30;
  const padT = 20;
  const maxVal = 900;
  const xStep = (w - padL - padR) / (data.length - 1);

  const toX = (i) => padL + i * xStep;
  const toY = (v) => padT + (h - padB - padT) - (v / maxVal) * (h - padB - padT);

  const totalPts = data.map((d, i) => `${toX(i)},${toY(d.total)}`).join(" ");
  const confirmedPts = data.map((d, i) => `${toX(i)},${toY(d.confirmed)}`).join(" ");
  const areaTotal = `${toX(0)},${h - padB} ${totalPts} ${toX(data.length - 1)},${h - padB}`;
  const areaConfirmed = `${toX(0)},${h - padB} ${confirmedPts} ${toX(data.length - 1)},${h - padB}`;

  const gridVals = [0, 200, 400, 600, 800];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="admin-chart-svg">
      <defs>
        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gradConfirmed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A56A0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1A56A0" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {gridVals.map((v) => (
        <g key={v}>
          <line x1={padL} x2={w - padR} y1={toY(v)} y2={toY(v)} stroke="#e2e8f0" strokeWidth="0.8" />
          <text x={padL - 8} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
        </g>
      ))}

      <polygon points={areaTotal} fill="url(#gradTotal)" />
      <polygon points={areaConfirmed} fill="url(#gradConfirmed)" />
      <polyline points={totalPts} fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinejoin="round" />
      <polyline points={confirmedPts} fill="none" stroke="#1A56A0" strokeWidth="2.2" strokeLinejoin="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.total)} r="3.5" fill="#38BDF8" />
          <circle cx={toX(i)} cy={toY(d.confirmed)} r="3.5" fill="#1A56A0" />
          <text x={toX(i)} y={toY(d.total) - 7} textAnchor="middle" fontSize="9" fill="#64748b">{d.total}</text>
          <text x={toX(i)} y={h - 8} textAnchor="middle" fontSize="9.5" fill="#94a3b8">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Donut ─────────────────────────────────────────────────
function DonutChart({ data }) {
  const size = 150;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const innerR = 30;
  let cumulative = 0;

  const slices = data.map((item) => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += item.percent;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = item.percent > 50 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    return { ...item, d };
  });

  return (
    <div className="donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill="white" />
      </svg>
      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            <span>{item.label} {item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatutBadge({ statut }) {
  const map = { "Confirmé": "badge-confirm", "En attente": "badge-pending", "Annulé": "badge-cancel" };
  return <span className={`badge ${map[statut] || ""}`}>{statut}</span>;
}

// ── Layout Admin ──────────────────────────────────────────
export default function DashboardAdmin({ activePage = "dashboard", onNavigate }) {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">Woorkly<span className="logo-dot">,</span></div>
        <nav className="sidebar-nav">
          {["Dashboard", "Salles", "Reservations", "Utilisateurs"].map((item) => (
            <button
              key={item}
              className={`nav-item ${activePage === item.toLowerCase() ? "active" : ""}`}
              onClick={() => onNavigate && onNavigate(item.toLowerCase())}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-page-title">Dashboard Admin</h1>
        </div>

        <div className="admin-content">
          {/* KPIs */}
          <section className="kpi-row">
            {kpis.map((k, i) => (
              <div key={i} className={`kpi-card kpi-${k.color}`}>
                <p className="kpi-label">{k.label}</p>
                <div className="kpi-bottom">
                  <span className="kpi-value">{k.value} <span className="kpi-unit">{k.unit}</span></span>
                  <span className="kpi-delta">{k.delta}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Graphique tendance */}
          <section className="card chart-section">
            <div className="chart-header">
              <h3 className="card-title">Tendances des Réservations (Mensuel)<span className="chart-total"> Total: 840</span></h3>
              <div className="chart-legend-inline">
                <span className="cl-dot" style={{ background: "#38BDF8" }} /> Total Réservations
                <span className="cl-dot" style={{ background: "#1A56A0" }} /> Confirmées
              </div>
            </div>
            <AreaChart data={monthlyData} />
          </section>

          {/* Bottom row */}
          <section className="bottom-row">
            <div className="card donut-section">
              <h3 className="card-title">Usage des Salles par Type</h3>
              <DonutChart data={usageData} />
            </div>

            <div className="card table-section">
              <h3 className="card-title">Dernières Réservations</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date/Heure</th>
                    <th>Salle</th>
                    <th>Utilisateur</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lastReservations.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.salle}</td>
                      <td>{r.utilisateur}</td>
                      <td><StatutBadge statut={r.statut} /></td>
                      <td>
                        <button className="action-btn edit">✏️</button>
                        <button className="action-btn del">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}