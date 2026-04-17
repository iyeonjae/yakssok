export interface Room {
  id: string;
  title: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  createdBy?: string;
}

export interface ResponseData {
  id: string;
  name: string;
  selectedDates: string[]; // ISO date strings
  updatedAt: string;
}
