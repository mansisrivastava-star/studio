export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface Territory {
  paths: LatLngLiteral[][];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  territory: Territory;
  status: 'winning' | 'losing' | 'neutral';
}
