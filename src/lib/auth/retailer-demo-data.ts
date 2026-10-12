export type RetailerDemoOrder = {
  id: string;
  createdAt: string;
  status: "Processing" | "Ready for pickup" | "Delivered";
  items: { name: string; quantity: number }[];
  note: string;
};

export const retailerDemoOrders: RetailerDemoOrder[] = [
  {
    id: "DEMO-2401",
    createdAt: "2026-10-08",
    status: "Processing",
    items: [
      { name: "Mobile display assembly", quantity: 5 },
      { name: "Replacement battery", quantity: 10 },
    ],
    note: "Example order only — not submitted to the store.",
  },
  {
    id: "DEMO-2394",
    createdAt: "2026-10-03",
    status: "Ready for pickup",
    items: [
      { name: "Charging flex cable", quantity: 8 },
      { name: "Tempered glass protector", quantity: 20 },
    ],
    note: "Example order only — no items are reserved.",
  },
  {
    id: "DEMO-2380",
    createdAt: "2026-09-25",
    status: "Delivered",
    items: [{ name: "USB-C charging port", quantity: 6 }],
    note: "Example order only — no payment was recorded.",
  },
];
