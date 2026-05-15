import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./adminStyle.css";

const kpis = [
  { label: "Salles Total",             value: "12",    unit: "Salles",        delta: "+15%", c: "c-blue"   },
  { label: "Réservations Aujourd'hui", value: "48",    unit: "Réservations",  delta: "+22%", c: "c-teal"   },
  { label: "Utilisateurs Actifs",      value: "256",   unit: "Utilisateurs",  delta: "+8%",  c: "c-green"  },
  { label: "Taux d'Occupation",        value: "78.5%", unit: "",              delta: "+10%", c: "c-orange" },
];

const monthly = [
  { month: "Jan", total: 350, conf: 200 },
  { month: "Fév", total: 450, conf: 280 },
  { month: "Mar", total: 350, conf: 220 },
  { month: "Avr", total: 450, conf: 300 },
  { month: "Mai", total: 460, conf: 310 },
  { month: "Jun", total: 670, conf: 420 },
  { month: "Jul", total: 680, conf: 450 },
  { month: "Aoû", total: 790, conf: 530 },
  { month: "Sep", total: 610, conf: 400 },
  { month: "Oct", total: 840, conf: 600 },
];

const donutData = [
  { label: "Réunions Équipe",  pct: 45, color: "#1A56A0" },
  { label: "Visioconférences", pct: 25, color: "#38BDF8" },
  { label: "Présentations",    pct: 15, color: "#10B981" },
  { label: "Ateliers",         pct: 10, color: "#F59E0B" },
  { label: "Autre",            pct: 5,  color: "#94a3b8" },
];

const lastResa = [
  { dt: "Oct 15 14:00", salle: "Innovation Hub", user: "Sarah Dupont", statut: "Confirmé"   },
  { dt: "Oct 15 11:30", salle: "Boardroom A",    user: "Marc Lemoine", statut: "En attente" },
  { dt: "Oct 15 11:30", salle: "Boardroom A",    user: "Marc Lemoine", statut: "Annulé"     },
  { dt: "Oct 15 14:00", salle: "Innovation Hub", user: "Sarah Dupont", statut: "Confirmé"   },
];

function AreaChart({ data }) {
  const W = 820, H = 250, pL = 48, pR = 20, pT = 20, pB = 28, max = 900;
  const cW = W - pL - pR, cH = H - pT - pB;
  const x = (i) => pL + (i / (data.length - 1)) * cW;
  const y = (v) => pT + cH - (v / max) * cH;
  const ptT = data.map((d, i) => `${x(i)},${y(d.total)}`).join(" ");
  const ptC = data.map((d, i) => `${x(i)},${y(d.conf)}`).join(" ");
  const aT  = `${x(0)},${H - pB} ${ptT} ${x(data.length - 1)},${H - pB}`;
  const aC  = `${x(0)},${H - pB} ${ptC} ${x(data.length - 1)},${H - pB}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="area-svg">
      <defs>
        <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A56A0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1A56A0" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {[0, 200, 400, 600, 800].map((v) => (
        <g key={v}>
          <line x1={pL} x2={W - pR} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="0.8" />
          <text x={pL - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <polygon points={aT} fill="url(#gT)" />
      <polygon points={aC} fill="url(#gC)" />
      <polyline points={ptT} fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={ptC} fill="none" stroke="#1A56A0" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.total)} r="3.5" fill="#38BDF8" />
          <circle cx={x(i)} cy={y(d.conf)}  r="3.5" fill="#1A56A0" />
          <text x={x(i)} y={y(d.total) - 7} textAnchor="middle" fontSize="9" fill="#64748b">{d.total}</text>
          <text x={x(i)} y={H - 7}          textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ data }) {
  const sz = 140, cx = 70, cy = 70, R = 50, r = 28;
  let cum = 0;
  const slices = data.map((item) => {
    const a0 = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    cum += item.pct;
    const a1 = (cum / 100) * 2 * Math.PI - Math.PI / 2;
    const lg = item.pct > 50 ? 1 : 0;
    const d = `M ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A ${R} ${R} 0 ${lg} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${lg} 0 ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} Z`;
    return { ...item, d };
  });
  return (
    <div className="donut-wrap">
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={r} fill="white" />
      </svg>
      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="leg-item">
            <span className="leg-dot" style={{ background: item.color }} />
            <span>{item.label} {item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const IconEdit = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

function Badge({ s }) {
  const m = { "Confirmé": "b-confirm", "En attente": "b-pending", "Annulé": "b-cancel" };
  return <span className={`badge ${m[s] || ""}`}>{s}</span>;
}

const NAV_ROUTES = {
  Dashboard:    "/dashboardAdmin",
  Salles:       "/Gestionsalles",
  Reservations: "/GestionReservations",
  Utilisateurs: "/GestionUser",
};

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="admin-wrap">
      <aside className="sidebar">
        <div className="sidebar-logo">Woorkly<span>,</span></div>
        <nav className="sidebar-nav">
          {["Dashboard", "Salles", "Reservations", "Utilisateurs"].map((p) => (
            <button key={p} className={`snav-btn ${NAV_ROUTES[p] === pathname ? "active" : ""}`} onClick={() => navigate(NAV_ROUTES[p])}>{p}</button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="topbar">Dashboard Admin</div>
        <div className="page-body">

          <div className="kpi-row">
            {kpis.map((k, i) => (
              <div key={i} className={`kpi-card ${k.c}`}>
                <p className="kpi-label">{k.label}</p>
                <div className="kpi-row-val">
                  <span className="kpi-val">{k.value}<span className="kpi-unit"> {k.unit}</span></span>
                  <span className="kpi-delta">{k.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.6rem" }}>
              <span className="card-title" style={{ marginBottom: 0 }}>
                Tendances des Réservations (Mensuel)
                <span style={{ fontSize:"0.75rem", fontWeight:400, color:"var(--muted)", marginLeft:"0.5rem" }}>Total: 840</span>
              </span>
              <div className="chart-legend-row">
                <span className="cl-dot" style={{ background:"#38BDF8" }} /> Total Réservations
                <span className="cl-dot" style={{ background:"#1A56A0" }} /> Confirmées
              </div>
            </div>
            <AreaChart data={monthly} />
          </div>

          <div className="bottom-row">
            <div className="card card-pad">
              <p className="card-title">Usage des Salles par Type</p>
              <Donut data={donutData} />
            </div>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"0.85rem 1rem 0.5rem" }}>
                <p className="card-title" style={{ marginBottom:0 }}>Dernières Réservations</p>
              </div>
              <table className="data-table">
                <thead><tr><th>Date/Heure</th><th>Salle</th><th>Utilisateur</th><th>Statut</th><th>Action</th></tr></thead>
                <tbody>
                  {lastResa.map((r, i) => (
                    <tr key={i}>
                      <td>{r.dt}</td><td>{r.salle}</td><td>{r.user}</td>
                      <td><Badge s={r.statut} /></td>
                      <td><button className="act-btn"><IconEdit /></button><button className="act-btn"><IconTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}