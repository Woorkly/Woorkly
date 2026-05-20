import { useState } from "react";
import { useAuth } from '../../../hooks/useAuth';
import "./DashboardUser.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  return (
    <div className="donut-wrapper">
      <div className="donut-visual">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            dataKey="percent"
            nameKey="label"
            innerRadius={48}
            outerRadius={72}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-pct">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ data }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 20, left: 24, bottom: 12 }}>
          <defs>
            <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A56A0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1A56A0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip formatter={(value) => [value, '']} />
          <Line
            type="monotone"
            dataKey="reservations"
            stroke="#1A56A0"
            strokeWidth={2.2}
            dot={{ r: 3.5 }}
            name="Mon Réservation"
          />
          <Line
            type="monotone"
            dataKey="annulations"
            stroke="#F59E0B"
            strokeWidth={1.8}
            strokeDasharray="4 3"
            dot={false}
            name="Taux d'Annulation"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
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
  const { user } = useAuth();
  const dashboardName = user?.nom || user?.email || 'Utilisateur';
  const dashboardEmail = user?.email || '';
  const avatarLabel = dashboardName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-logo">Woorkly</span>
          <span className="dash-title">Dashboard de {dashboardName}</span>
        </div>
        <div className="dash-avatar">
          <span>{avatarLabel || 'U'}</span>
        </div>
      </header>

      <div className="dashboard-subtitle">
        {dashboardEmail ? `Connecté en tant que ${dashboardEmail}` : 'Compte connecté'}
      </div>

      <main className="dash-main">
        <section className="kpi-row">
          <div className="kpi-card kpi-accent">
            <p className="kpi-label">Mes Réservations à Venir</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>4 <span className="kpi-unit">salles</span></p>
          </div>
          <div className="kpi-card kpi-blue">
            <p className="kpi-label">Heures en Réunion</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>32h <span className="kpi-unit">ce mois</span></p>
          </div>
          <div className="kpi-card kpi-green">
            <p className="kpi-label">Taux de Présence</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>98%</p>
          </div>
        </section>

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