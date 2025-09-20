import type { Player } from './types';

export const mockPlayers: Player[] = [
  {
    id: 'user_1',
    name: 'Sardar Khan',
    color: '#3357FF', // Blue
    score: 1250,
    status: 'winning',
    territory: {
      paths: [
        [
          { lat: 37.7749, lng: -122.4194 },
          { lat: 37.7752, lng: -122.4170 },
          { lat: 37.7730, lng: -122.4172 },
        ],
      ],
    },
  },
  {
    id: 'user_2',
    name: 'Shahid Khan',
    color: '#FF5733', // Red-Orange
    score: 980,
    status: 'neutral',
    territory: {
      paths: [
        [
          { lat: 37.78, lng: -122.43 },
          { lat: 37.781, lng: -122.425 },
          { lat: 37.778, lng: -122.424 },
          { lat: 37.777, lng: -122.429 },
        ],
      ],
    },
  },
  {
    id: 'user_3',
    name: 'Ramadhir Singh',
    color: '#33FF57', // Green
    score: 1100,
    status: 'neutral',
    territory: {
      paths: [
        [
          { lat: 37.765, lng: -122.418 },
          { lat: 37.766, lng: -122.415 },
          { lat: 37.763, lng: -122.414 },
          { lat: 37.762, lng: -122.417 },
        ],
      ],
    },
  },
  {
    id: 'user_4',
    name: 'Faizal Khan',
    color: '#FF33A1', // Pink
    score: 750,
    status: 'losing',
    territory: {
      paths: [
        [
          { lat: 37.77, lng: -122.44 },
          { lat: 37.771, lng: -122.435 },
          { lat: 37.768, lng: -122.434 },
        ],
      ],
    },
  },
];
