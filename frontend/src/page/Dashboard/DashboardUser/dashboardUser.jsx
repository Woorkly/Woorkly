import { useState } from "react";
import "./dbuser.css";

const upcomingReservations = [
  { date: "Oct 15 14:00", salle: "Innovation Hub", utilisateur: "Sarah Dupont", statut: "Confirmé" },
  { date: "Oct 16 09:00", salle: "Boardroom A", utilisateur: "Marc Lemoine", statut: "Confirmé" },
  { date: "Oct 17 11:00", salle: "Boardroom B", utilisateur: "Sarah Dupont", statut: "Confirmé" },
];

const historyReservations = [
  { date: "Oct 15 11:30", salle: "Boardroom A", utilisateur: "Marc Lemoine", statut: "Terminé" },
  { date: "Oct 15 11:30", salle: "Boardroom A", utilisateur: "Marc Lemoine", statut: "Annulé" },
  { date: "Oct 14 10:00", salle: "Innovation Hub", utilisateur: "Sarah Dupont", statut: "Terminé" },
  { date: "Oct 13 15:00", salle: "Boardroom B", utilisateur: "Marc Lemoine", statut: "Terminé" },
];

const monthlyData = [
  { month: "Jan", reservations: 40, annulations: 20 },
  { month: "Fév", reservations: 30, annulations: 25 },
  { month: "Mar", reservations: 90, annulations: 15 },
  { month: "Avr", reservations: 60, annulations: 30 },
  { month: "Mai", reservations: 30, annulations: 20 },
  { month: "Jun", reservations: 40, annulations: 10 },
  { month: "Jul", reservations: 50, annulations: 25 },
  { month: "Aoû", reservations: 80, annulations: 20 },
  { month: "Sep", reservations: 80, annulations: 15 },
  { month: "Oct", reservations: 6, annulations: 5 },
];

const usageData = [
  { label: "Team Syncs", percent: 50, color: "#1A56A0" },
  { label: "Client Calls", percent: 30, color: "#38BDF8" },
  { label: "Planning", percent: 20, color: "#10B981" },
  { label: "Ateliers", percent: 10, color: "#F59E0B" },
];

function DonutChart({ data }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 54;
  const innerR = 32;
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
    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
    return { ...item, d };
  });

  return (
    <div className="donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} className="donut-slice" />
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill="var(--card-bg)" />
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

function AreaChart({ data }) {
  const w = 800;
  const h = 340;
  const padL = 30;
  const padB = 26;
  const padT = 18;
  const maxVal = 100;
  const xStep = (w - padL - 10) / (data.length - 1);

  const toX = (i) => padL + i * xStep;
  const toY = (v) => padT + (h - padB - padT) - ((v / maxVal) * (h - padB - padT));

  const linePoints = data.map((d, i) => `${toX(i)},${toY(d.reservations)}`).join(" ");
  const areaPoints = `${toX(0)},${h - padB} ${linePoints} ${toX(data.length - 1)},${h - padB}`;
  const cancelPoints = data.map((d, i) => `${toX(i)},${toY(d.annulations)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="area-chart-svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A56A0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1A56A0" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((v) => (
        <line key={v} x1={padL} x2={w - 10} y1={toY(v)} y2={toY(v)} stroke="#e2e8f0" strokeWidth="0.8" />
      ))}

      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline points={cancelPoints} fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 3" strokeLinejoin="round" />
      <polyline points={linePoints} fill="none" stroke="#1A56A0" strokeWidth="2.2" strokeLinejoin="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.reservations)} r="3.5" fill="#1A56A0" />
          <text x={toX(i)} y={toY(d.reservations) - 7} textAnchor="middle" fontSize="9" fill="#64748b">{d.reservations}</text>
          <text x={toX(i)} y={h - 7} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

function StatutBadge({ statut }) {
  const map = {
    Confirmé: "badge-confirm",
    Terminé: "badge-done",
    Annulé: "badge-cancel",
  };
  return <span className={`badge ${map[statut] || ""}`}>{statut}</span>;
}

export default function DashboardUser() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-logo">Woorkly</span>
          <span className="dash-title">Dashboard utilisateur</span>
        </div>
        <div className="dash-avatar">
          <span>SD</span>
        </div>
      </header>

      <main className="dash-main">
        {/* KPIs */}
        <section style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", margin:"0 2rem" }}>
          <div className="kpi-card kpi-accent" style={{ padding:"0.85rem 1.1rem" }}>
            <p className="kpi-label">Mes Réservations à Venir</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>4 <span className="kpi-unit">salles</span></p>
          </div>
          <div className="kpi-card kpi-blue" style={{ padding:"0.85rem 1.1rem" }}>
            <p className="kpi-label">Heures en Réunion</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>32h <span className="kpi-unit">ce mois</span></p>
          </div>
          <div className="kpi-card kpi-green" style={{ padding:"0.85rem 1.1rem" }}>
            <p className="kpi-label">Taux de Présence</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>98%</p>
          </div>
        </section>

        {/* Charts row */}
        <section className="charts-row">
          <div className="card chart-card">
            <h3 className="card-title">Mon Activité de Réservation (Annuel)</h3>
            <AreaChart data={monthlyData} />
            <div className="chart-legend">
              <span className="legend-line blue" />
              <span className="legend-label">Mon Réservation</span>
              <span className="legend-line yellow dashed" />
              <span className="legend-label">Taux d'Annulation</span>
            </div>
          </div>

          <div className="card donut-card">
            <h3 className="card-title">Mon Usage par Type de Réunion</h3>
            <DonutChart data={usageData} />
          </div>
        </section>

        {/* Tables row */}
        <section className="tables-row">
          <div className="card table-card">
            <div className="table-tabs">
              <button
                className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Réservations — À Venir
              </button>
              <button
                className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Historique Complet
              </button>
            </div>
            <table className="resa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Salle</th>
                  <th>Utilisateur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "upcoming" ? upcomingReservations : historyReservations).map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.salle}</td>
                    <td>{r.utilisateur}</td>
                    <td><StatutBadge statut={r.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}