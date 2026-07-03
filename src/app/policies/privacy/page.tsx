import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BuckThatDuck",
  description:
    "How Pleeter LLC collects, uses, and shares information at buckthatduck.com.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section
    className="surface"
    style={{ padding: "32px 36px", display: "grid", gap: "20px" }}
  >
    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-gold)" }}>
      {title}
    </h2>
    <div style={{ display: "grid", gap: "14px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
      {children}
    </div>
  </section>
);

const Sub = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontWeight: 700, color: "var(--color-text)" }}>{children}</p>
);

const link = { color: "var(--color-gold)", textDecoration: "underline" } as const;
const strong = { color: "var(--color-text)" } as const;
const ulStyle = { display: "grid", gap: "10px", paddingLeft: "1.2rem", margin: 0 } as const;

export default function PrivacyPage() {
  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ display: "grid", gap: "8px" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            How Pleeter LLC collects, uses, and shares your information at buckthatduck.com.
          </p>
          <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem" }}>
            Last updated: June 20, 2026
          </p>
        </div>

        {/* Stripe carve-out callout */}
        <div
          style={{
            background: "var(--color-gold-dim)",
            borderLeft: "3px solid var(--color-gold)",
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
            padding: "16px 20px",
            color: "var(--color-text-muted)",
            lineHeight: 1.7,
          }}
        >
          This is our own Privacy Policy. It does <strong style={strong}>not</strong> govern
          how Stripe, our payment processor, handles your credit card information. Stripe
          processes card payments under its own separate privacy policy — see the{" "}
          <strong style={strong}>Payment Processing</strong> section below.
        </div>

        <Section title="Overview">
          <p>
            This Privacy Policy describes how Pleeter LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
            or &ldquo;our&rdquo;) collects, uses, and shares information when you visit or make
            a purchase at <strong style={strong}>buckthatduck.com</strong> (the &ldquo;Site&rdquo;)
            for our custom 3D-printed figurines (&ldquo;BuckThatDuck,&rdquo; &ldquo;Bucks,&rdquo;
            or the &ldquo;Products&rdquo;).
          </p>
          <p>By using the Site, you agree to the practices described in this policy.</p>
        </Section>

        <Section title="Information We Collect">
          <Sub>Information you give us</Sub>
          <p>When you browse, build, or place an order, we may collect:</p>
          <ul style={ulStyle}>
            <li><strong style={strong}>Contact details</strong> — your name and email address.</li>
            <li><strong style={strong}>Shipping details</strong> — the postal address you provide for delivery.</li>
            <li><strong style={strong}>Order details</strong> — the Products you purchase, quantities, and order history.</li>
            <li>
              <strong style={strong}>Custom configuration data</strong> — the choices you make in
              our configurator (body color, mane style, stand, accessories, and similar options),
              including saved builds so you can return to a design you started.
            </li>
            <li><strong style={strong}>Communications</strong> — messages you send us for customer support or other inquiries.</li>
          </ul>

          <Sub>Information we do not collect</Sub>
          <p>
            We do <strong style={strong}>not</strong> collect or store your full credit or debit
            card number, card expiration date, or CVC. That information is entered into and
            handled directly by Stripe.
          </p>

          <Sub>Information collected automatically</Sub>
          <p>
            When you visit the Site, we and our hosting and analytics providers may automatically
            collect limited technical information such as your IP address, browser type, device
            information, pages viewed, and the dates and times of your visits. Some of this is
            collected through cookies and similar technologies.
          </p>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul style={ulStyle}>
            <li>Process, fulfill, and ship your orders.</li>
            <li>
              Send order confirmations, shipping updates, and other transactional emails (sent from{" "}
              <a href="mailto:orders@buckthatduck.com" style={link}>orders@buckthatduck.com</a>).
            </li>
            <li>Save your custom builds so you can resume or reorder them.</li>
            <li>Respond to your questions and provide customer support.</li>
            <li>Operate, maintain, secure, and improve the Site and our Products.</li>
            <li>Detect and prevent fraud and abuse.</li>
            <li>Comply with our legal obligations.</li>
          </ul>
          <p>We do <strong style={strong}>not</strong> sell your personal information.</p>
        </Section>

        <Section title="Payment Processing">
          <p>
            All payments on the Site are processed by{" "}
            <strong style={strong}>Stripe, Inc. (&ldquo;Stripe&rdquo;)</strong>.
          </p>
          <p>
            When you check out, your payment card information is transmitted directly to Stripe and
            is handled under <strong style={strong}>Stripe&rsquo;s own privacy policy and terms</strong>,
            which are separate from this Privacy Policy. We never receive or store your full card
            details on our systems. We may receive limited confirmation information from Stripe, such
            as whether a payment succeeded, the last four digits of your card, the card brand, and a
            transaction identifier, so that we can manage your order.
          </p>
          <p>
            You can review Stripe&rsquo;s privacy practices at{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>
              stripe.com/privacy
            </a>
            . We are not responsible for Stripe&rsquo;s handling of your information, and any
            questions about how Stripe processes card data should be directed to Stripe.
          </p>
        </Section>

        <Section title="How We Share Your Information">
          <p>We share personal information only as needed to run our business:</p>
          <ul style={ulStyle}>
            <li><strong style={strong}>Stripe</strong> — to process payments, as described above.</li>
            <li>
              <strong style={strong}>Hosting and infrastructure providers</strong> — we host the Site
              and store order and build data with <strong style={strong}>Amazon Web Services, Inc.
              (&ldquo;AWS&rdquo;)</strong>, our cloud hosting and infrastructure provider, and use
              related AWS services to send transactional email.
            </li>
            <li>
              <strong style={strong}>Shipping and fulfillment partners</strong> — to deliver your
              Products, we share the name and address needed for delivery.
            </li>
            <li>
              <strong style={strong}>Legal and safety</strong> — we may disclose information if
              required by law, subpoena, or legal process, or to protect the rights, property, or
              safety of Pleeter LLC, our customers, or others.
            </li>
            <li>
              <strong style={strong}>Business transfers</strong> — if we are involved in a merger,
              acquisition, or sale of assets, your information may be transferred as part of that
              transaction.
            </li>
          </ul>
          <p>
            We do not sell, rent, or trade your personal information to third parties for their own
            marketing purposes.
          </p>
        </Section>

        <Section title="Data Storage and Security">
          <p>
            Your order and build information is stored on secured cloud infrastructure provided by
            Amazon Web Services, Inc. (AWS). We use reasonable administrative, technical, and physical
            safeguards designed to protect your information. However, no method of transmission or
            storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            We retain order and contact information for as long as needed to fulfill your order,
            provide support, and meet our legal, accounting, and tax obligations. Saved build
            configurations are retained so you can return to them, until you ask us to delete them
            or they are no longer needed.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use cookies and similar technologies to keep the Site working, remember your session
            and cart, and understand how the Site is used. Most browsers let you refuse or delete
            cookies through your browser settings. Some features of the Site may not function
            properly if cookies are disabled.
          </p>
        </Section>

        <Section title="Your Rights and Choices">
          <p>
            Depending on where you live, you may have rights regarding your personal information,
            including the right to:
          </p>
          <ul style={ulStyle}>
            <li>Request access to the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your personal information.</li>
            <li>
              Opt out of certain processing or the sale or sharing of personal information (note: we
              do not sell your personal information).
            </li>
          </ul>
          <p>
            <strong style={strong}>California residents</strong> have specific rights under the
            California Consumer Privacy Act (CCPA/CPRA).{" "}
            <strong style={strong}>Residents of the EU and UK</strong> have rights under the GDPR.{" "}
            <strong style={strong}>Residents of New Jersey and other states with comprehensive
            consumer privacy laws</strong> (including, among others, Colorado, Connecticut, Oregon,
            Texas, and Virginia) have similar rights under their respective state laws. To exercise
            any of these rights, contact us using the details below. We will respond as required by
            applicable law. We will not discriminate against you for exercising your rights.
          </p>
        </Section>

        <Section title="Children&rsquo;s Privacy">
          <p>
            The Site is not directed to children under 13, and we do not knowingly collect personal
            information from children under 13. If you believe a child has provided us with personal
            information, please contact us and we will delete it.
          </p>
        </Section>

        <Section title="Third-Party Links">
          <p>
            The Site may contain links to third-party websites. We are not responsible for the
            privacy practices or content of those sites. We encourage you to review the privacy
            policies of any third-party sites you visit.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &ldquo;Last updated&rdquo; date above. Material changes will be posted on this page, and
            your continued use of the Site after changes are posted constitutes acceptance of the
            updated policy.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have questions about this Privacy Policy or how we handle your information,
            contact us at:
          </p>
          <address style={{ fontStyle: "normal", lineHeight: 1.9, color: "var(--color-text)" }}>
            <strong style={strong}>Pleeter LLC</strong><br />
            8 Nelke Ct<br />
            Hawthorne, NJ 07506<br />
            Email: <a href="mailto:orders@buckthatduck.com" style={link}>orders@buckthatduck.com</a><br />
            Website: buckthatduck.com
          </address>
        </Section>

        {/* Footer note */}
        <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem", textAlign: "center" }}>
          🇺🇸 Proudly made in the USA · Pleeter LLC
        </p>

      </div>
    </main>
  );
}
