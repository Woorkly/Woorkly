import "./AdminStyle.css";

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

import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function AreaChart({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <ReAreaChart data={data} margin={{ top: 20, right: 20, left: 48, bottom: 28 }}>
          <defs>
            <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A56A0" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#1A56A0" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e6eef9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip formatter={(value) => [value, '']} />
          <Area type="monotone" dataKey="total" stroke="#38BDF8" fill="url(#gT)" strokeWidth={2} dot={{ r: 3.5 }} />
          <Area type="monotone" dataKey="conf"  stroke="#1A56A0" fill="url(#gC)" strokeWidth={2} dot={{ r: 3.5 }} />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Donut({ data }) {
  const COLORS = data.map((d) => d.color);
  return (
    <div className="donut-wrap" style={{ alignItems: 'flex-start' }}>
      <div style={{ width: 140, height: 140, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="pct" nameKey="label" innerRadius={44} outerRadius={68} startAngle={90} endAngle={-270} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="donut-legend" style={{ marginLeft: 8 }}>
        {data.map((item, i) => (
          <div key={i} className="leg-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="leg-dot" style={{ background: item.color }} />
              <span className="leg-label">{item.label}</span>
            </div>
            <div className="leg-pct">{item.pct}%</div>
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

export default function DashboardAdmin() {
  return (
    <>
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
            <div className="table-scroll">
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

      </div>
    </>
  );
}