const db = require('../config/db');

const MONTH_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Jun',
  'Jul',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

const formatMonth = (monthNumber) => MONTH_LABELS[monthNumber - 1] || String(monthNumber);

const DAILY_AVAILABLE_HOURS = 10;

const getAdminDashboardStats = async () => {
  const [
    totalSallesRows,
    reservationsTodayRows,
    totalUtilisateursRows,
    occupationRows,
    monthlyRows,
    typeRows,
    recentRows,
  ] = await Promise.all([
    db.execute('SELECT COUNT(*) AS total_salles FROM salles'),
    db.execute("SELECT COUNT(*) AS reservations_today FROM reservations WHERE date = CURDATE() AND statut <> 'annulee'"),
    db.execute('SELECT COUNT(*) AS total_utilisateurs FROM utilisateurs'),
    db.execute(`
      SELECT
          COALESCE(
            ROUND(
              (
                SELECT COALESCE(SUM(TIME_TO_SEC(TIMEDIFF(heure_fin, heure_debut)) / 3600), 0)
                FROM reservations
                WHERE date = CURDATE()
                  AND statut <> 'annulee'
              ) / NULLIF((SELECT COUNT(*) * ${DAILY_AVAILABLE_HOURS} FROM salles), 0) * 100,
              1
            ),
            0
          ) AS taux_occupation
    `),
    db.execute(`
      SELECT
        MONTH(r.date) AS month_number,
        COUNT(*) AS total_reservations,
        SUM(CASE WHEN r.statut = 'confirmee' THEN 1 ELSE 0 END) AS confirmees
      FROM reservations r
      WHERE YEAR(r.date) = YEAR(CURDATE())
      GROUP BY MONTH(r.date)
      ORDER BY MONTH(r.date)
    `),
    db.execute(`
      SELECT
        t.nom AS type_name,
        COUNT(*) AS total
      FROM reservations r
      JOIN salles s ON r.salle_id = s.id
      JOIN types t ON s.type_id = t.id
      WHERE r.statut <> 'annulee'
      GROUP BY t.id, t.nom
      ORDER BY total DESC, t.nom ASC
    `),
    db.execute(`
      SELECT
        r.id,
        r.date,
        r.heure_debut,
        r.heure_fin,
        r.statut,
        r.type_reservation,
        s.nom AS salle_nom,
        u.nom AS user_nom
      FROM reservations r
      JOIN salles s ON r.salle_id = s.id
      JOIN utilisateurs u ON r.utilisateur_id = u.id
      ORDER BY r.date DESC, r.heure_debut DESC, r.id DESC
      LIMIT 4
    `),
  ]);

  const [totalSallesResult] = totalSallesRows;
  const [reservationsTodayResult] = reservationsTodayRows;
  const [totalUtilisateursResult] = totalUtilisateursRows;
  const [occupationResult] = occupationRows;
  const [monthlyResult] = monthlyRows;
  const [typeResult] = typeRows;
  const [recentResult] = recentRows;

  const monthlyByMonth = new Map(
    monthlyResult.map((row) => [Number(row.month_number), row])
  );

  const monthly_trends = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const row = monthlyByMonth.get(monthNumber);

    return {
      month: formatMonth(monthNumber),
      total_reservations: Number(row?.total_reservations || 0),
      confirmees: Number(row?.confirmees || 0),
    };
  });

  const totalTypeUsage = typeResult.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const type_usage = typeResult.map((row) => ({
    type: row.type_name,
    total: Number(row.total || 0),
    percentage: totalTypeUsage > 0 ? Math.round((Number(row.total || 0) / totalTypeUsage) * 100) : 0,
  }));

  return {
    kpis: {
      total_salles: Number(totalSallesResult?.total_salles || 0),
      reservations_today: Number(reservationsTodayResult?.reservations_today || 0),
      total_utilisateurs: Number(totalUtilisateursResult?.total_utilisateurs || 0),
      taux_occupation: Number(occupationResult?.taux_occupation || 0),
    },
    monthly_trends,
    type_usage,
    recent_reservations: recentResult.map((row) => ({
      id: row.id,
      date: row.date,
      heure_debut: row.heure_debut,
      heure_fin: row.heure_fin,
      statut: row.statut,
      type_reservation: row.type_reservation,
      salle_nom: row.salle_nom,
      user_nom: row.user_nom,
    })),
  };
};

module.exports = {
  getAdminDashboardStats,
};