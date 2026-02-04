export type EventType = "travel" | "hotel" | "restaurant" | "activity";

export type TravelSubType = "flight" | "train" | "ferry" | "drive";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  user_id: string;
  share_token: string | null;
  created_at: string;
}

export interface TripShare {
  id: string;
  trip_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  role: "editor";
  created_at: string;
}

export interface TripEvent {
  id: string;
  trip_id: string;
  type: EventType;
  sub_type: TravelSubType | null;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  confirmation_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface FlightLookupResult {
  title: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string | null;
  arrival_time: string | null;
  duration_minutes: number | null;
  route: string;
}

export interface BenEatsRestaurant {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
}

export interface Todo {
  id: string;
  trip_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}
