import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Mi Arcade",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="font-heading text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as:</p>
        <ul>
          <li>Account information (email, username, password)</li>
          <li>Profile information (display name, avatar, bio)</li>
          <li>Content you create (games, comments, reactions)</li>
          <li>Communications with us</li>
        </ul>

        <h2>2. Automatically Collected Information</h2>
        <p>When you use Mi Arcade, we automatically collect:</p>
        <ul>
          <li>Usage data (pages visited, games played)</li>
          <li>Device information (browser type, operating system)</li>
          <li>IP address and general location</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Analyze usage patterns to improve user experience</li>
          <li>Detect, prevent, and address technical issues</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share information with:
        </p>
        <ul>
          <li>Service providers who assist in our operations</li>
          <li>Law enforcement when required by law</li>
          <li>Other parties with your consent</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. 
          However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Export your data</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          We use cookies to maintain your session and preferences. You can control cookies 
          through your browser settings.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Mi Arcade is not intended for children under 13. We do not knowingly collect 
          information from children under 13.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of 
          significant changes by posting a notice on our website.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us through our contact page.
        </p>
      </div>
    </div>
  );
}
