function Badge({ status }) {
  const classMap = {
    disponible: "b-available",
    reservee: "b-blue",
    "hors-service": "b-offline",
  };

  const labelMap = {
    disponible: "Disponible",
    reservee: "Reservee",
    "hors-service": "Hors service",
  };

  return (
    <span className={`badge ${classMap[status] || ""}`}>
      {labelMap[status] || status || "Non renseigne"}
    </span>
  );
}

export default Badge;
