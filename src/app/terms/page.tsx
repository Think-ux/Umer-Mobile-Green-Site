import PolicyPage from "@/components/PolicyPage";

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms and conditions"
      description="Terms for browsing and purchasing from Umer Mobile Parts."
      confirmationItems={[
        "Product listing, pricing and availability terms",
        "Order acceptance, payment and cancellation rules",
        "Customer, retailer and dispute-resolution terms",
      ]}
    />
  );
}
