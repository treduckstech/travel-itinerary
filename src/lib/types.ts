export type EventType = "flight" | "hotel" | "restaurant" | "activity";

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface TripEvent {
  id: string;
  trip_id: string;
  user_id: string;
  type: EventType;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  confirmation_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Todo {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}
