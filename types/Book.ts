export interface IBook {
  id: string;
  title: string;
  author: string;
  date_read: string;
  link: boolean | string;
  notes?: string;
}

export type BooksByYear = Record<string, IBook[]>;
