// Utilidades para el juego de ruleta

/**
 * Obtiene el emoji del animal correspondiente a un número
 * @param num Número del 1 al 30
 * @returns Emoji del animal
 */
export const getAnimalEmoji = (num: number): string => {
  const animals = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', // 1-10
    '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', // 11-20
    '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢'  // 21-30
  ];
  return animals[num - 1] || '🐾';
};

/**
 * Obtiene el nombre del animal correspondiente a un número
 * @param num Número del 1 al 30
 * @returns Nombre del animal
 */
export const getAnimalName = (num: number): string => {
  const animalNames = [
    'Perro', 'Gato', 'Ratón', 'Hámster', 'Conejo', 'Zorro', 'Oso', 'Panda', 'Oso Polar', 'Koala',
    'Tigre', 'León', 'Vaca', 'Cerdo', 'Rana', 'Mono', 'Pollo', 'Pingüino', 'Pájaro', 'Pollito',
    'Lobo', 'Jabalí', 'Caballo', 'Unicornio', 'Abeja', 'Gusano', 'Mariposa', 'Caracol', 'Mariquita', 'Tortuga'
  ];
  return animalNames[num - 1] || 'Animal Misterioso';
};

/**
 * Obtiene el color CSS para un número
 * @param num Número del 1 al 30
 * @returns Clase CSS de TailwindCSS
 */
export const getNumberColor = (num: number): string => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  return colors[num % colors.length];
};

/**
 * Formatea una cantidad de dinero
 * @param amount Cantidad
 * @returns Cantidad formateada con símbolo de dólar
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

/**
 * Calcula el porcentaje de victoria
 * @param wins Victorias
 * @param total Total de juegos
 * @returns Porcentaje formateado
 */
export const calculateWinRate = (wins: number, total: number): string => {
  if (total === 0) return '0.0';
  return ((wins / total) * 100).toFixed(1);
};
