function RoomDeleteModal({
  room,
  onConfirm,
  onCancel,
  loading,
  error,
}) {
  if (!room) return null;

  return (
    <div className="ud-overlay" onClick={onCancel}>
      <div
        className="ud-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420 }}
      >
        <button
          className="ud-close"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          x
        </button>

        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            Supprimer la salle
          </h2>
          <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
            "{room.nom}"
          </p>
        </div>

        <p style={{ color: "var(--text)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est{" "}
          <strong>irréversible</strong>.
        </p>

        {error && (
          <p style={{ color: "var(--red)", marginBottom: "1rem", fontSize: "0.85rem" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="ud-btn-secondary"
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Annuler
          </button>
          <button
            className="ud-btn-danger"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomDeleteModal;
