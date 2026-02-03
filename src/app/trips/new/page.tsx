import { TripForm } from "@/components/trips/trip-form";

export default function NewTripPage() {
  return (
    <div className="py-8">
      <p className="mx-auto mb-6 max-w-lg text-center text-sm text-muted-foreground">
        Start with the basics — you can add flights, hotels, and activities once your trip is created.
      </p>
      <TripForm />
    </div>
  );
}
