import PolicyPage from "@/components/PolicyPage";

export default function ReturnsPolicyPage() {
  return (
    <PolicyPage
      title="Returns and refunds"
      description="Information about return, exchange, warranty and refund terms."
      confirmationItems={[
        "Eligible products, return window and item-condition requirements",
        "Warranty coverage and exclusions for installed or tested parts",
        "Refund method, timing and return-shipping responsibility",
      ]}
    />
  );
}
