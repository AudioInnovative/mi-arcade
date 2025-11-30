import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Mi Arcade",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="font-heading text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Mi Arcade, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Mi Arcade is a platform that allows users to discover, play, and share HTML5 games. 
          Creators can upload and manage their games, while players can browse and interact with content.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. 
          You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h2>4. Content Guidelines</h2>
        <p>Users agree not to upload or share content that:</p>
        <ul>
          <li>Infringes on intellectual property rights</li>
          <li>Contains malware or malicious code</li>
          <li>Is illegal, harmful, or offensive</li>
          <li>Violates any applicable laws or regulations</li>
        </ul>

        <h2>5. Creator Responsibilities</h2>
        <p>
          Game creators must own or have the rights to all content they upload. 
          Creators are responsible for ensuring their games comply with all applicable laws.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          Creators retain ownership of their games. By uploading content, you grant Mi Arcade 
          a license to host and display your content on the platform.
        </p>

        <h2>7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend accounts that violate these terms 
          or engage in harmful behavior.
        </p>

        <h2>8. Disclaimer</h2>
        <p>
          Mi Arcade is provided "as is" without warranties of any kind. We are not responsible 
          for user-generated content or third-party games hosted on the platform.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the service after 
          changes constitutes acceptance of the new terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          If you have questions about these terms, please contact us through our contact page.
        </p>
      </div>
    </div>
  );
}
