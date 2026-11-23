import type { Metadata } from "next";
import CarForm from "../CarForm";
import { createCar } from "../actions";

export const metadata: Metadata = { title: "Add car" };

export default function NewCarPage() {
  return (
    <>
      <h1 className="font-sign text-5xl font-bold">Add a car</h1>
      <p className="mt-2 text-muted">Enter the price in cedis. You can add photos and videos after saving.</p>
      <div className="mt-8 max-w-3xl">
        <CarForm action={createCar} initial={{ status: "AVAILABLE" }} submitLabel="Save car" />
      </div>
    </>
  );
}
