import { PrismaClient } from "@prisma/client";
import { distanceKm } from "../services/maps.service.js";

const prisma = new PrismaClient();

// Paramètres SLA (minutes) pour les pénalités
const SLA_PICKUP_MIN = Number(process.env.SLA_PICKUP_MIN || 15);
const SLA_DELIVERY_MIN = Number(process.env.SLA_DELIVERY_MIN || 60);

// Helper: uniquement CURRENT_LOCATION (lat/lng) ou PREDEFINED_LOCATION (location avec lat/lng)
function resolvePickupPoint(delivery) {
  if (
    delivery.pickupSource === 'CURRENT_LOCATION' &&
    typeof delivery.pickupLatitude === 'number' &&
    typeof delivery.pickupLongitude === 'number'
  ) {
    return { lat: delivery.pickupLatitude, lng: delivery.pickupLongitude };
  }
  if (
    delivery.pickupSource === 'PREDEFINED_LOCATION' &&
    delivery.pickupLocation &&
    typeof delivery.pickupLocation.latitude === 'number' &&
    typeof delivery.pickupLocation.longitude === 'number'
  ) {
    return { lat: delivery.pickupLocation.latitude, lng: delivery.pickupLocation.longitude };
  }
  return null;
}

async function resolvePickupPointById(id) {
  const full = await prisma.delivery.findUnique({ where: { id }, include: { pickupLocation: true } });
  if (!full) return null;
  return resolvePickupPoint(full);
}

// Création livraison (seulement CURRENT_LOCATION ou PREDEFINED_LOCATION)
export const createDelivery = async (req, res) => {
  try {
    const {
      notes,

      pickupSource, // CURRENT_LOCATION | PREDEFINED_LOCATION
      pickupLocationId,
      pickupLatitude,
      pickupLongitude,
      pickupComment,

      dropoffSource, // CURRENT_LOCATION | PREDEFINED_LOCATION
      dropoffLocationId,
      dropoffLatitude,
      dropoffLongitude,
      dropoffComment,
    } = req.body || {};

    // Validation pickup
    if (pickupSource !== 'CURRENT_LOCATION' && pickupSource !== 'PREDEFINED_LOCATION') {
      return res.status(400).json({ message: 'pickupSource invalide' });
    }
    if (pickupSource === 'CURRENT_LOCATION') {
      if (typeof pickupLatitude !== 'number' || typeof pickupLongitude !== 'number') {
        return res.status(400).json({ message: 'pickupLatitude & pickupLongitude requis pour CURRENT_LOCATION' });
      }
    } else {
      if (!pickupLocationId) {
        return res.status(400).json({ message: 'pickupLocationId requis pour PREDEFINED_LOCATION' });
      }
    }
    // Validation supplémentaire: vérifier l'existence des lieux prédéfinis pour éviter une erreur FK
    let validPickupLocation = null;
    let validDropoffLocation = null;
    if (pickupSource === 'PREDEFINED_LOCATION') {
      validPickupLocation = await prisma.mapLocation.findUnique({ where: { id: pickupLocationId } });
      if (!validPickupLocation || validPickupLocation.active === false) {
        return res.status(400).json({ message: "Emplacement de retrait introuvable ou inactif" });
      }
    }
        if (dropoffSource === 'PREDEFINED_LOCATION') {
          validDropoffLocation = await prisma.mapLocation.findUnique({ where: { id: dropoffLocationId } });
          if (!validDropoffLocation || validDropoffLocation.active === false) {
            return res.status(400).json({ message: "Emplacement de dépôt introuvable ou inactif" });
          }
        }

      // Validation dropoff
      if (dropoffSource !== 'CURRENT_LOCATION' && dropoffSource !== 'PREDEFINED_LOCATION') {
        return res.status(400).json({ message: 'dropoffSource invalide' });
      }
      if (dropoffSource === 'CURRENT_LOCATION') {
        if (typeof dropoffLatitude !== 'number' || typeof dropoffLongitude !== 'number') {
          return res.status(400).json({ message: 'dropoffLatitude & dropoffLongitude requis pour CURRENT_LOCATION' });
        }
      } else {
        if (!dropoffLocationId) {
          return res.status(400).json({ message: 'dropoffLocationId requis pour PREDEFINED_LOCATION' });
        }
      }

      const delivery = await prisma.delivery.create({
        data: {
          createdById: req.user.id,
          notes: notes || null,

          pickupSource,
          pickupLocationId: pickupSource === 'PREDEFINED_LOCATION' ? pickupLocationId : null,
          pickupLatitude: pickupSource === 'CURRENT_LOCATION' ? pickupLatitude : null,
          pickupLongitude: pickupSource === 'CURRENT_LOCATION' ? pickupLongitude : null,
          pickupComment: pickupComment || null,

          dropoffSource,
          dropoffLocationId: dropoffSource === 'PREDEFINED_LOCATION' ? dropoffLocationId : null,
          dropoffLatitude: dropoffSource === 'CURRENT_LOCATION' ? dropoffLatitude : null,
          dropoffLongitude: dropoffSource === 'CURRENT_LOCATION' ? dropoffLongitude : null,
          dropoffComment: dropoffComment || null,

          status: 'CREATED',
        },
        include: { pickupLocation: true, dropoffLocation: true },
      });

      const ACTIVE_STALENESS_MS = Number(process.env.ACTIVE_STALENESS_MS || 5 * 60 * 1000);
      const freshSince = new Date(Date.now() - ACTIVE_STALENESS_MS);
      const pickupPoint = resolvePickupPoint(delivery);

      let chosen = null;
      let bestKm = Infinity;

      if (pickupPoint) {
        const candidates = await prisma.courierLocation.findMany({
          where: {
            isActive: true,
            updatedAt: { gte: freshSince },
            latitude: { not: null },
            longitude: { not: null },
            user: {
              role: 'LIVREUR',
              deliveriesAssigned: { none: { status: { in: ['ASSIGNED', 'PICKED_UP'] } } },
            },
          },
          select: { userId: true, latitude: true, longitude: true, updatedAt: true },
        });

        for (const c of candidates) {
          const km = await distanceKm({ lat: c.latitude, lng: c.longitude }, pickupPoint);
          if (km != null && km < bestKm) {
            bestKm = km;
            chosen = c;
          }
        }

        if (chosen) {
          await prisma.delivery.update({
            where: { id: delivery.id },
            data: { assignedToId: chosen.userId, status: 'ASSIGNED', assignedAt: new Date() },
          });
        }
      }

      return res.status(201).json({
        message: chosen ? 'Livraison créée et attribuée' : 'Livraison créée',
        deliveryId: delivery.id,
        assignedTo: chosen ? { id: chosen.userId, distanceKm: Number(bestKm.toFixed(2)) } : null,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Le livreur envoie sa localisation (uniquement s'il est actif) – lat/lng obligatoires
  export const updateCourierLocation = async (req, res) => {
    try {
      if (req.user.role !== 'LIVREUR') return res.status(403).json({ message: "Interdit" });
      const { latitude, longitude } = req.body || {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'latitude & longitude sont obligatoires' });
      }
      const loc = await prisma.courierLocation.findUnique({ where: { userId: req.user.id } });
      if (!loc || !loc.isActive) {
        return res.status(403).json({ message: 'Activez votre disponibilité avant d’envoyer la position' });
      }
      const updated = await prisma.courierLocation.update({
        where: { userId: req.user.id },
        data: { latitude, longitude, updatedAt: new Date() },
      });
      return res.json({ message: 'Position mise à jour', location: updated });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  // Activer/désactiver la disponibilité du livreur
  export const setCourierAvailability = async (req, res) => {
    try {
      if (req.user.role !== 'LIVREUR') return res.status(403).json({ message: 'Interdit' });
      const { active } = req.body || {};
      if (typeof active !== 'boolean') return res.status(400).json({ message: 'active (boolean) est requis' });

      const record = await prisma.courierLocation.upsert({
        where: { userId: req.user.id },
        create: {
          user: { connect: { id: req.user.id } },
          currentAddress: "",
          isActive: active
        },
        update: { isActive: active, updatedAt: new Date() },
      });
      return res.json({ message: active ? 'Vous êtes disponible' : 'Vous êtes indisponible', availability: { isActive: record.isActive, updatedAt: record.updatedAt } });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Marquer comme pris en charge
  export const markPickedUp = async (req, res) => {
    try {
      const id = req.params.id;
      const d = await prisma.delivery.findUnique({ where: { id } });
      if (!d) return res.status(404).json({ message: "Livraison introuvable" });
      if (req.user.role !== 'ADMIN' && d.assignedToId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

      await prisma.delivery.update({ where: { id }, data: { status: 'PICKED_UP', pickedUpAt: new Date() } });
      return res.json({ message: "Parcel picked up", deliveryId: id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erreur server" });
    }
  };

  // Marquer les livraisons comme terminer
  export const markDelivered = async (req, res) => {
    try {
      const id = req.params.id;
      const d = await prisma.delivery.findUnique({ where: { id } });
      if (!d) return res.status(404).json({ message: "Livraison introuvable" });
      if (req.user.role !== 'ADMIN' && d.assignedToId !== req.user.id) return res.status(403).json({ message: "Interdit" });

      const now = new Date();
      const updated = await prisma.delivery.update({
        where: { id },
        data: { status: 'DELIVERED', deliveredAt: now },
      });

      return res.json({ message: "Livraison terminée", deliveryId: id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };

  // Annuler (admin)
  export const cancelDelivery = async (req, res) => {
    try {
      const id = req.params.id;
      const d = await prisma.delivery.findUnique({ where: { id } });
      if (!d) return res.status(404).json({ message: "Livraison introuvable" });
      const updated = await prisma.delivery.update({ where: { id }, data: { status: 'CANCELED', canceledAt: new Date() } });
      return res.json({ message: "Delivery canceled", deliveryId: id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Mes livraisons : si livreur -> qui me sont assignées, sinon -> que j'ai créées
  export const getMyDeliveries = async (req, res) => {
    try {
      let where = {};
      if (req.user.role === 'LIVREUR') where = { assignedToId: req.user.id };
      else where = { createdById: req.user.id };
      const rows = await prisma.delivery.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.json({ data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Détail d'une livraison (visible par admin, créateur, livreur assigné)
  export const getDeliveryById = async (req, res) => {
    try {
      const id = req.params.id;
      const d = await prisma.delivery.findUnique({ where: { id } });
      if (!d) return res.status(404).json({ message: "Delivery not found" });
      if (
        req.user.role !== 'ADMIN' &&
        d.createdById !== req.user.id &&
        d.assignedToId !== req.user.id
      ) return res.status(403).json({ message: "Forbidden" });
      return res.json({ data: d });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Statistiques admin pour le tableau de bord
  export const adminStats = async (req, res) => {
    try {
      const [total, created, assigned, picked, delivered, canceled, topPenalized] = await Promise.all([
        prisma.delivery.count(),
        prisma.delivery.count({ where: { status: 'CREATED' } }),
        prisma.delivery.count({ where: { status: 'ASSIGNED' } }),
        prisma.delivery.count({ where: { status: 'PICKED_UP' } }),
        prisma.delivery.count({ where: { status: 'DELIVERED' } }),
        prisma.delivery.count({ where: { status: 'CANCELED' } }),
        prisma.penalty.groupBy({
          by: ['userId'],
          _sum: { points: true },
          orderBy: { _sum: { points: 'desc' } },
          take: 10,
        }),
      ]);

      return res.json({
        total,
        byStatus: { created, assigned, picked, delivered, canceled },
        topPenalized,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Lister les pénalités (admin, filtre par userId/deliveryId)
  export const listPenalties = async (req, res) => {
    try {
      const { userId, deliveryId } = req.query;
      const where = {};
      if (userId) where.userId = userId;
      if (deliveryId) where.deliveryId = deliveryId;
      const rows = await prisma.penalty.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.json({ data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Décliner une livraison (livreur) -> pénalité unique DECLINE_ASSIGNMENT + tentative de réassignation
  export const declineDelivery = async (req, res) => {
    try {
      const id = req.params.id;
      const delivery = await prisma.delivery.findUnique({ where: { id } });
      if (!delivery) return res.status(404).json({ message: 'Livraison introuvable' });
      if (delivery.status !== 'ASSIGNED') return res.status(400).json({ message: 'Cette livraison ne peut pas être déclinée' });
      if (delivery.assignedToId !== req.user.id) return res.status(403).json({ message: 'Interdit' });
      const { reason } = req.body || {};

      // Limite quotidienne
      const MAX_DECLINES_PER_DAY = Number(process.env.MAX_DECLINES_PER_DAY || 3);
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const declinesToday = await prisma.deliveryDecline.count({
        where: { courierId: req.user.id, createdAt: { gte: start } }
      });
      if (declinesToday >= MAX_DECLINES_PER_DAY) {
        return res.status(429).json({ message: `Limite de déclinaisons atteinte (${MAX_DECLINES_PER_DAY}/jour)` });
      }

      // Crée pénalité DECLINE_ASSIGNMENT
      await prisma.penalty.create({
        data: {
          userId: req.user.id,
          deliveryId: delivery.id,
          type: 'DECLINE_ASSIGNMENT',
          points: 1,
          reason: 'Livraison déclinée par le livreur'
        }
      });

      // Journaliser la déclinaison
      await prisma.deliveryDecline.create({
        data: {
          deliveryId: delivery.id,
          courierId: req.user.id,
          reason: reason || null,
        }
      });

      // Remet la livraison en CREATED pour réassignation
      const reset = await prisma.delivery.update({
        where: { id },
        data: { status: 'CREATED', assignedToId: null, assignedAt: null }
      });

      // Tenter réassignation automatique (reuse logique simplifiée)
      const ACTIVE_STALENESS_MS = Number(process.env.ACTIVE_STALENESS_MS || 5 * 60 * 1000);
      const freshSince = new Date(Date.now() - ACTIVE_STALENESS_MS);
      const pickupPoint = await resolvePickupPointById(id);
      const candidates = await prisma.courierLocation.findMany({
        where: {
          isActive: true,
          updatedAt: { gte: freshSince },
          latitude: { not: null },
          longitude: { not: null },
          user: {
            role: 'LIVREUR',
            deliveriesAssigned: { none: { status: { in: ['ASSIGNED', 'PICKED_UP'] } } },
          },
        },
        select: { userId: true, latitude: true, longitude: true },
      });
      let chosen = null; let bestKm = Infinity;
      for (const c of candidates) {
        const km = await distanceKm({ lat: c.latitude, lng: c.longitude }, pickupPoint);
        if (km != null && km < bestKm) { bestKm = km; chosen = c; }
      }
      if (chosen) {
        await prisma.delivery.update({ where: { id }, data: { assignedToId: chosen.userId, status: 'ASSIGNED', assignedAt: new Date() } });
      }
      return res.json({ message: 'Livraison déclinée', reAssignedTo: chosen ? chosen.userId : null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Liste des déclinaisons du livreur courant
  export const listMyDeclines = async (req, res) => {
    try {
      if (req.user.role !== 'LIVREUR') return res.status(403).json({ message: 'Interdit' });
      const rows = await prisma.deliveryDecline.findMany({
        where: { courierId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Liste des déclinaisons (admin, filtre par courierId ou deliveryId)
  export const adminListDeclines = async (req, res) => {
    try {
      if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Interdit' });
      const { courierId, deliveryId } = req.query;
      const where = {};
      if (courierId) where.courierId = courierId;
      if (deliveryId) where.deliveryId = deliveryId;
      const rows = await prisma.deliveryDecline.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.json({ data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Noter le livreur pour une livraison (créateur uniquement après statut DELIVERED)
  export const rateDelivery = async (req, res) => {
    try {
      const id = req.params.id;
      const { score, comment } = req.body;
      if (score == null || score < 1 || score > 5) return res.status(400).json({ message: 'score doit être entre 1 et 5' });
      const delivery = await prisma.delivery.findUnique({ where: { id } });
      if (!delivery) return res.status(404).json({ message: 'Livraison introuvable' });
      if (delivery.createdById !== req.user.id) return res.status(403).json({ message: 'Interdit' });
      if (delivery.status !== 'DELIVERED') return res.status(400).json({ message: 'Cette livraison n’est pas encore livrée' });
      if (!delivery.assignedToId) return res.status(400).json({ message: 'Aucun livreur assigné' });

      // Empêcher double note
      const existing = await prisma.deliveryRating.findUnique({ where: { deliveryId: id } });
      if (existing) return res.status(400).json({ message: 'Déjà notée' });

      const rating = await prisma.deliveryRating.create({
        data: {
          deliveryId: id,
          courierId: delivery.assignedToId,
          createdById: req.user.id,
          score,
          comment: comment || null,
        }
      });
      return res.status(201).json({ message: 'Note enregistrée', rating });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Récupérer la note d’une livraison
  export const getDeliveryRating = async (req, res) => {
    try {
      const id = req.params.id;
      const rating = await prisma.deliveryRating.findUnique({ where: { deliveryId: id } });
      if (!rating) return res.json({ rating: null });
      return res.json({ rating });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Moyenne des notes d’un livreur
  export const courierRatingSummary = async (req, res) => {
    try {
      const { courierId } = req.params;
      const ratings = await prisma.deliveryRating.findMany({ where: { courierId } });
      if (!ratings.length) return res.json({ courierId, avg: null, count: 0 });
      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      return res.json({ courierId, avg: Number((sum / ratings.length).toFixed(2)), count: ratings.length });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // --- Suivi ponctuel (polling) ---
  // Retourne l'état courant et la localisation du livreur (si assigné) pour une livraison donnée
  export const trackingInfo = async (req, res) => {
    try {
      const id = req.params.id;
      const delivery = await prisma.delivery.findUnique({ where: { id } });
      if (!delivery) return res.status(404).json({ message: 'Livraison introuvable' });

      const isCreator = delivery.createdById === req.user.id;
      const isCourier = delivery.assignedToId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      if (!isCreator && !isCourier && !isAdmin) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      let courierLocation = null;
      if (delivery.assignedToId) {
        courierLocation = await prisma.courierLocation.findUnique({ where: { userId: delivery.assignedToId } });
      }

      return res.json({
        delivery: {
          id: delivery.id,
          status: delivery.status,
          pickupAddress: delivery.pickupAddress,
          dropoffAddress: delivery.dropoffAddress,
          createdAt: delivery.createdAt,
          assignedAt: delivery.assignedAt,
          pickedUpAt: delivery.pickedUpAt,
          deliveredAt: delivery.deliveredAt,
          canceledAt: delivery.canceledAt,
        },
        courier: delivery.assignedToId ? { id: delivery.assignedToId } : null,
        courierLocation: courierLocation
          ? { currentAddress: courierLocation.currentAddress, latitude: courierLocation.latitude, longitude: courierLocation.longitude, updatedAt: courierLocation.updatedAt }
          : null,
        isFinished: ['DELIVERED', 'CANCELED'].includes(delivery.status),
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  // Suivi en temps réel via SSE
  export const streamTracking = async (req, res) => {
    const id = req.params.id;
    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) return res.status(404).json({ message: 'Livraison introuvable' });
    if (![delivery.createdById, delivery.assignedToId].includes(req.user.id) && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Accès refusé' });

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders && res.flushHeaders();

    const send = (data, event) => res.write(`${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`);
    const intervalMs = Number(process.env.TRACKING_REFRESH_MS || 10000);
    let finished = false;

    const snapshot = async () => {
      try {
        const d = await prisma.delivery.findUnique({ where: { id } });
        if (!d) return end('deleted');
        const loc = d.assignedToId
          ? await prisma.courierLocation.findUnique({ where: { userId: d.assignedToId } })
          : null;
        const payload = {
          id: d.id,
          status: d.status,
          assignedToId: d.assignedToId,
          timestamps: {
            createdAt: d.createdAt,
            assignedAt: d.assignedAt,
            pickedUpAt: d.pickedUpAt,
            deliveredAt: d.deliveredAt,
            canceledAt: d.canceledAt
          },
          courierLocation: loc
            ? { latitude: loc.latitude, longitude: loc.longitude, updatedAt: loc.updatedAt, currentAddress: loc.currentAddress }
            : null,
          isFinished: ['DELIVERED', 'CANCELED'].includes(d.status)
        };
        send(payload);
        if (payload.isFinished) end('finished');
      } catch {
        end('error');
      }
    };

    const end = (reason) => {
      if (finished) return;
      finished = true;
      send({ reason }, 'end');
      clearInterval(timer);
      res.end();
    };

    await snapshot();
    const timer = setInterval(snapshot, intervalMs);
    // Heartbeat pour garder la connexion (optionnel)
    const hb = setInterval(() => !finished && res.write(': ping\n\n'), 30000);

    req.on('close', () => { clearInterval(timer); clearInterval(hb); end('client_close'); });
  };