// src/app/(dashboard)/rezervacije/page.tsx
import RezervacijeClient from "./RezervacijeClient";

export default function RezervacijePage() {
  return (
    <div
      className="-m-6 flex flex-col"
      style={{ height: "calc(100vh - 64px - 36px)" }}
    >
      <RezervacijeClient />
    </div>
  );
}
