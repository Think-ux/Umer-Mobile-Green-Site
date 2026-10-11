import PolicyPage from "@/components/PolicyPage";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      description="How customer information is collected, used and protected."
      confirmationItems={[
        "Personal information collected during browsing, checkout and support",
        "How order and contact information is used, stored and shared",
        "Customer data-retention, access and deletion processes",
      ]}
    />
  );
}
