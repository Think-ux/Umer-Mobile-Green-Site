import PolicyPage from "@/components/PolicyPage";

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping policy"
      description="Shipping terms for orders placed with Umer Mobile Parts."
      confirmationItems={[
        "Delivery areas and courier coverage",
        "Delivery fees, free-shipping thresholds and estimated timelines",
        "Dispatch, delays and failed-delivery handling",
      ]}
    />
  );
}
