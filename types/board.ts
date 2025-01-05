export interface Board {
  id: string;
  name: string;
  description: string;
  links: Link[];
  type: 'saved' | 'instant';
  createdAt: number;
}

export interface Link {
  id: string;
  url: string;
  description: string;
  visited: boolean;
  createdAt: number;
  deadline?: string;
}

