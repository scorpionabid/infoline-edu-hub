
import { v4 as uuidv4 } from 'uuid';

export const generateRandomId = (): string => {
  return uuidv4();
};

export const getRandomColor = (): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
