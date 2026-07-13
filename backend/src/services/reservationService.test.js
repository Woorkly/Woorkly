jest.mock('../models/Reservation', () => ({
  getByRoomAndDate: jest.fn(),
  hasConflict: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  cancel: jest.fn(),
  updateStatut: jest.fn(),
}));

jest.mock('../models/Room', () => ({
  getById: jest.fn(),
}));

const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const reservationService = require('./reservationService');

describe('reservationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePrice', () => {
    it('calcule le prix pour une réservation à l\'heure selon la durée', () => {
      const room = { prix_heure: 10 };
      const prix = reservationService.calculatePrice(room, 'heure', '09:00', '11:30');
      expect(prix).toBe(25);
    });

    it('retourne le prix demi-journée pour ce type de réservation', () => {
      const room = { prix_demi_journee: 50 };
      expect(reservationService.calculatePrice(room, 'demi-journee', '08:00', '12:00')).toBe(50);
    });

    it('retourne le prix journée pour ce type de réservation', () => {
      const room = { prix_journee: 90 };
      expect(reservationService.calculatePrice(room, 'journee', '08:00', '18:00')).toBe(90);
    });

    it('retourne 0 pour un type de réservation inconnu', () => {
      const room = { prix_heure: 10, prix_demi_journee: 50, prix_journee: 90 };
      expect(reservationService.calculatePrice(room, 'inconnu', '08:00', '18:00')).toBe(0);
    });
  });

  describe('getDisponibilite', () => {
    it('rejette si salle_id ou date manquant', async () => {
      await expect(reservationService.getDisponibilite(null, '2026-07-13')).rejects.toThrow(
        'salle_id et date sont requis'
      );
    });

    it('retourne toutes les plages disponibles sans réservation existante', async () => {
      Reservation.getByRoomAndDate.mockResolvedValue([]);

      const result = await reservationService.getDisponibilite(1, '2026-07-13');

      expect(result).toEqual({
        journee_disponible: true,
        matin_disponible: true,
        apres_midi_disponible: true,
      });
    });

    it('marque le matin indisponible en cas de chevauchement', async () => {
      Reservation.getByRoomAndDate.mockResolvedValue([
        { heure_debut: '09:00:00', heure_fin: '10:00:00' },
      ]);

      const result = await reservationService.getDisponibilite(1, '2026-07-13');

      expect(result).toEqual({
        journee_disponible: false,
        matin_disponible: false,
        apres_midi_disponible: true,
      });
    });
  });

  describe('createReservation', () => {
    const baseData = {
      salle_id: 1,
      date: '2026-07-20',
      heure_debut: '09:00',
      heure_fin: '10:00',
      type_reservation: 'heure',
    };

    it('rejette si des informations sont manquantes', async () => {
      await expect(
        reservationService.createReservation({ ...baseData, salle_id: null }, 42)
      ).rejects.toThrow('Les informations de réservation sont incomplètes');
    });

    it('rejette une date antérieure à aujourd\'hui', async () => {
      await expect(
        reservationService.createReservation({ ...baseData, date: '2020-01-01' }, 42)
      ).rejects.toThrow('Vous ne pouvez pas réserver une date antérieure à aujourd\'hui');
    });

    it('rejette si la salle est introuvable', async () => {
      Room.getById.mockResolvedValue(null);

      await expect(reservationService.createReservation(baseData, 42)).rejects.toThrow(
        'Salle introuvable'
      );
    });

    it('rejette en cas de chevauchement horaire', async () => {
      Room.getById.mockResolvedValue({ id: 1, prix_heure: 10 });
      Reservation.hasConflict.mockResolvedValue(true);

      await expect(reservationService.createReservation(baseData, 42)).rejects.toThrow(
        'Cette salle est déjà réservée à cet horaire'
      );
    });

    it('crée la réservation avec le prix calculé quand tout est valide', async () => {
      Room.getById.mockResolvedValue({ id: 1, prix_heure: 10 });
      Reservation.hasConflict.mockResolvedValue(false);
      Reservation.create.mockResolvedValue(123);

      const result = await reservationService.createReservation(baseData, 42);

      expect(Reservation.create).toHaveBeenCalledWith({
        date: baseData.date,
        heure_debut: baseData.heure_debut,
        heure_fin: baseData.heure_fin,
        type_reservation: baseData.type_reservation,
        statut: 'en-attente',
        prix_total: 10,
        salle_id: baseData.salle_id,
        utilisateur_id: 42,
      });
      expect(result).toEqual({
        id: 123,
        date: baseData.date,
        heure_debut: baseData.heure_debut,
        heure_fin: baseData.heure_fin,
        type_reservation: baseData.type_reservation,
        statut: 'en-attente',
        prix_total: 10,
        salle_id: baseData.salle_id,
        utilisateur_id: 42,
      });
    });
  });

  describe('cancelReservation', () => {
    it('rejette si la réservation est introuvable', async () => {
      Reservation.getById.mockResolvedValue(null);

      await expect(reservationService.cancelReservation(1, 42)).rejects.toThrow(
        'Réservation introuvable'
      );
    });

    it('rejette si l\'utilisateur n\'est ni propriétaire ni admin', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, utilisateur_id: 99, statut: 'en-attente' });

      await expect(reservationService.cancelReservation(1, 42, false)).rejects.toThrow(
        'Accès refusé'
      );
    });

    it('rejette si la réservation est déjà annulée', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, utilisateur_id: 42, statut: 'annulee' });

      await expect(reservationService.cancelReservation(1, 42, false)).rejects.toThrow(
        'Cette réservation est déjà annulée'
      );
    });

    it('annule la réservation quand l\'utilisateur en est propriétaire', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, utilisateur_id: 42, statut: 'en-attente' });
      Reservation.cancel.mockResolvedValue(true);

      await expect(reservationService.cancelReservation(1, 42, false)).resolves.toBeUndefined();
      expect(Reservation.cancel).toHaveBeenCalledWith(1);
    });

    it('permet à un admin d\'annuler la réservation d\'un autre utilisateur', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, utilisateur_id: 99, statut: 'en-attente' });
      Reservation.cancel.mockResolvedValue(true);

      await expect(reservationService.cancelReservation(1, 42, true)).resolves.toBeUndefined();
      expect(Reservation.cancel).toHaveBeenCalledWith(1);
    });
  });

  describe('updateReservationStatut', () => {
    it('rejette un statut invalide', async () => {
      await expect(
        reservationService.updateReservationStatut(1, 'statut-inconnu', true)
      ).rejects.toThrow('Statut invalide: statut-inconnu');
    });

    it('rejette si la réservation est introuvable', async () => {
      Reservation.getById.mockResolvedValue(null);

      await expect(
        reservationService.updateReservationStatut(1, 'confirmee', true)
      ).rejects.toThrow('Réservation introuvable');
    });

    it('rejette si l\'utilisateur n\'est pas admin', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, statut: 'en-attente' });

      await expect(
        reservationService.updateReservationStatut(1, 'confirmee', false)
      ).rejects.toThrow('Accès refusé — modification de statut réservée aux administrateurs');
    });

    it('met à jour le statut quand l\'utilisateur est admin', async () => {
      Reservation.getById.mockResolvedValue({ id: 1, statut: 'en-attente' });
      Reservation.updateStatut.mockResolvedValue(true);

      await expect(
        reservationService.updateReservationStatut(1, 'confirmee', true)
      ).resolves.toBeUndefined();
      expect(Reservation.updateStatut).toHaveBeenCalledWith(1, 'confirmee');
    });
  });
});
