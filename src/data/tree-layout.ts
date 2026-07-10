/**
 * Hand-composed positions for the Kuru tree, like Dark's hand-laid family
 * graph. Units are abstract grid cells (x: columns, y: generations).
 *
 * Composition: Kaurava wing on the left, Pandava wing on the right,
 * the royal trunk down the center, the Yadavas (Krishna) at the far right,
 * the teachers at the far left — and Karna alone in the middle,
 * belonging to both sides and neither.
 */
export const TREE_POSITIONS: Record<string, { x: number; y: number }> = {
  // the source
  ganga: { x: -1.6, y: 0 },
  shantanu: { x: 0, y: 0 },
  satyavati: { x: 1.6, y: 0 },
  vyasa: { x: 3.2, y: 0.5 },

  // gen 1
  bhishma: { x: -1.6, y: 1.1 },
  sanjaya: { x: -6.5, y: 1.1 },

  // gen 2 — the split
  shakuni: { x: -7.9, y: 2 },
  gandhari: { x: -6.3, y: 2 },
  dhritarashtra: { x: -4.7, y: 2 },
  vidura: { x: -1.6, y: 2.2 },
  pandu: { x: 3, y: 2 },
  kunti: { x: 4.6, y: 2 },
  madri: { x: 6.2, y: 2 },
  shalya: { x: 7.8, y: 2 },

  // the Yadavas — the divine axis, far right
  balarama: { x: 11.6, y: 2.2 },
  krishna: { x: 10.1, y: 2.5 },
  subhadra: { x: 9.7, y: 3.6 },

  // gen 3 — Kaurava wing
  jayadratha: { x: -8.4, y: 3.1 },
  dushasana: { x: -6.4, y: 3.1 },
  duryodhana: { x: -4.6, y: 3.1 },

  // Karna — between the two worlds
  karna: { x: -2.4, y: 3.1 },

  // gen 3 — Pandava wing
  yudhishthira: { x: 1.9, y: 3.1 },
  bhima: { x: 3.4, y: 3.1 },
  arjuna: { x: 4.9, y: 3.1 },
  nakula: { x: 6.4, y: 3.1 },
  sahadeva: { x: 7.9, y: 3.1 },

  // Panchala — the fire-born
  drupada: { x: 0.4, y: 4.1 },
  dhrishtadyumna: { x: -1.1, y: 4.9 },
  shikhandi: { x: 1.9, y: 4.9 },
  draupadi: { x: 4.4, y: 4.3 },

  // the teachers, far left
  kripa: { x: -11.2, y: 4 },
  drona: { x: -9.6, y: 4 },
  ashwatthama: { x: -9.6, y: 5 },
  ekalavya: { x: -11.2, y: 5 },

  // gen 4
  ghatotkacha: { x: 3.4, y: 5.3 },
  abhimanyu: { x: 6.2, y: 5.1 },
  uttara: { x: 7.7, y: 5.1 },
  virata: { x: 9.2, y: 4.3 },

  // the survivor
  parikshit: { x: 6.95, y: 6.1 },
};

export const CELL_X = 138;
export const CELL_Y = 168;
