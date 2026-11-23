"use client";

import { deleteCar } from "./actions";

// Asks "are you sure?" before deleting, because deleting can't be undone.
export default function DeleteCarButton({ carId, carName }: { carId: string; carName: string }) {
  return (
    <form
      action={deleteCar.bind(null, carId)}
      onSubmit={(event) => {
        if (!window.confirm(`Remove the ${carName}? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="font-semibold text-red-700 hover:underline">
        Remove
      </button>
    </form>
  );
}
