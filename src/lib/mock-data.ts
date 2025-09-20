import type { Player } from './types';

export const mockPlayers: Player[] = [
  {
    id: 'user_1',
    name: 'Player One',
    color: '#3357FF', // Blue
    score: 1250,
    status: 'winning',
    territory: {
      paths: [
        [
          { lat: 37.78, lng: -122.42 },
          { lat: 37.78, lng: -122.41 },
          { lat: 37.77, lng: -122.41 },
          { lat: 37.77, lng: -122.42 },
        ],
      ],
    },
  },
  {
    id: 'user_2',
    name: 'CyberNomad',
    color: '#FF5733', // Red-Orange
    score: 980,
    status: 'neutral',
    territory: {
      paths: [
        [
          { lat: 37.79, lng: -122.43 },
          { lat: 37.79, lng: -122.42 },
          { lat: 37.78, lng: -122.42 },
          { lat: 37.78, lng: -122.43 },
        ],
      ],
    },
  },
  {
    id: 'user_3',
    name: 'ShadowStrider',
    color: '#33FF57', // Green
    score: 1100,
    status: 'neutral',
    territory: {
      paths: [
        [
          { lat: 37.76, lng: -122.41 },
          { lat: 37.76, lng: -122.40 },
          { lat: 37.75, lng: -122.40 },
          { lat: 37.75, lng: -122.41 },
        ],
      ],
    },
  },
  {
    id: 'user_4',
    name: 'PixelProwler',
    color: '#FF33A1', // Pink
    score: 750,
    status: 'losing',
    territory: {
      paths: [
        [
          { lat: 37.77, lng: -122.44 },
          { lat: 37.77, lng: -122.43 },
          { lat: 37.76, lng: -122.43 },
          { lat: 37.76, lng: -122.44 },
        ],
      ],
    },
  },
];
