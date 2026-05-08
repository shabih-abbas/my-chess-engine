const openingBook = {
  "Sicilian Defense": [
    ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4"], // Open Sicilian
    ["e2e4", "c7c5", "b1c3", "e7e6", "f2f4", "d7d5"],  // Grand Prix Attack
    ["e2e4", "c7c5", "g1f3", "e7e6", "d4", "c5d4"]      // French Variation
  ],
  "Queen's Gambit": [
    ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6"], // Declined
    ["d2d4", "d7d5", "c2c4", "d5c4", "e2e3", "g8f6"], // Accepted
    ["d2d4", "d7d5", "c2c4", "c7c6", "g1f3", "g8f6"]  // Slav Defense
  ],
  "Ruy Lopez": [
    ["e2e4", "e7e5", "g1f3", "b8c6", "b1b5", "a7a6"], // Morphy Defense
    ["e2e4", "e7e5", "g1f3", "b8c6", "b1b5", "g8f6"], // Berlin Defense
    ["e2e4", "e7e5", "g1f3", "b8c6", "b1b5", "f7f5"]  // Schliemann Defense
  ],
  "London System": [
    ["d2d4", "d5", "f4", "c5", "e3", "b8c6"],          // Modern Line
    ["d2d4", "g8f6", "c1f4", "d5", "e3", "c5"],       // Standard London
    ["d2d4", "d5", "c1f4", "g8f6", "e3", "e6"]        // Classic Symmetry
  ],
  "Italian Game": [
    ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"], // Giuoco Piano
    ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"], // Two Knights Defense
    ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3"] // Main Line
  ]
};
/**
 * @param {string} selectedOpening - e.g., "Sicilian Defense"
 * @param {string[]} history - Array of moves played so far (e.g., ["e2e4", "c7c5"])
 */
export function getBookMove(selectedOpening, history) {
  const variations = openingBook[selectedOpening];
  if (!variations) return null;

  const validVariations = variations.filter(v => 
    history.every((move, index) => v[index] === move)
  );

  if (validVariations.length === 0) return null; 

  const randomVar = validVariations[Math.floor(Math.random() * validVariations.length)];

  const nextMove = randomVar[history.length];

  return nextMove || null;
}