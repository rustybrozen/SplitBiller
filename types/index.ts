export interface Member {
  id: number;
  name: string;
}

export interface ExtraSplit {
  id: number;
  name: string;
  amount: number;
  members: number[];
}

export interface Bill {
  id: number;
  amount: number;
  description: string;
  payer: number;
  date: string;
  splitType: 'equal' | 'advanced';
  selectedMembers: number[];
  extraSplits: ExtraSplit[];
  status: 'open' | 'closed';
}

export interface Transfer {
  from: number;
  to: number;
  amount: number;
}

export interface AppSettings {
  roundingMode: 'none' | 'smart';
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}