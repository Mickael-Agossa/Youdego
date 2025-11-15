// Calcul de distance via Google Distance Matrix
// Supporte address string ou coordonnées { lat, lng } / { latitude, longitude }
// Retourne la distance en km ou null si indisponible (sans clé API ou réponse invalide)

function toMatrixParam(input) {
  if (!input) return null;
  // si string, considérer comme adresse
  if (typeof input === 'string') return input;
  // si objet {lat,lng} ou {latitude,longitude}
  const lat = input.lat ?? input.latitude;
  const lng = input.lng ?? input.longitude;
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `${lat},${lng}`;
  }
  // si MapLocation
  if (input.address) return input.address;
  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    return `${input.latitude},${input.longitude}`;
  }
  return null;
}

export async function distanceKm(from, to) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const origin = toMatrixParam(from);
  const destination = toMatrixParam(to);
  if (!origin || !destination) return null;

  const base = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    key,
    units: 'metric',
  });
  const res = await fetch(`${base}?${params.toString()}`);
  const data = await res.json();
  try {
    const meters = data.rows[0].elements[0].distance.value;
    return meters / 1000;
  } catch (_) {
    return null;
  }
}

// Backward compat: ancienne signature par adresses
export async function distanceKmByAddresses(fromAddress, toAddress) {
  return distanceKm(fromAddress, toAddress);
}
