import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BuckThatDuck",
  description:
    "The terms and conditions governing your use of buckthatduck.com and purchases from Pleeter LLC.",
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

export default function TermsPage() {
  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ display: "grid", gap: "8px" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            The terms and conditions governing your use of buckthatduck.com and purchases
            from Pleeter LLC.
          </p>
          <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem" }}>
            Last updated: July 3, 2026
          </p>
        </div>

        <Section title="Agreement to These Terms">
          <p>
            These Terms of Service (the &ldquo;Terms&rdquo;) are an agreement between you and
            Pleeter LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) and govern
            your access to and use of <strong style={strong}>buckthatduck.com</strong> (the
            &ldquo;Site&rdquo;) and your purchase of our custom 3D-printed figurines
            (&ldquo;Bucks&rdquo; or the &ldquo;Products&rdquo;).
          </p>
          <p>
            By using the Site or placing an order, you agree to these Terms and to our{" "}
            <a href="/policies/privacy" style={link}>Privacy Policy</a>. If you do not agree,
            please do not use the Site.
          </p>
        </Section>

        <Section title="Eligibility">
          <p>
            You must be at least 18 years old, or the age of majority where you live, to place
            an order. By ordering, you represent that you meet this requirement and that the
            information you provide is accurate and complete.
          </p>
        </Section>

        <Section title="Products &amp; Custom Orders">
          <p>
            Our Products are made-to-order, 3D-printed figurines configured by you in our
            builder. Because each Buck is produced individually:
          </p>
          <ul style={ulStyle}>
            <li>
              <strong style={strong}>Appearance may vary slightly.</strong> On-screen previews
              are illustrations. Actual colors, textures, and finish may differ modestly from
              what you see on your display, and small layer lines or surface variations are a
              normal characteristic of 3D printing.
            </li>
            <li>
              <strong style={strong}>Custom nameplates.</strong> Custom nameplate text is
              limited to 12 characters and is printed exactly as you enter it — please double-check
              spelling before checkout.
            </li>
            <li>
              <strong style={strong}>Content standards.</strong> You may not submit nameplate
              text that is unlawful, hateful, harassing, obscene, or that infringes someone
              else&rsquo;s rights (including trademarks). We may cancel and refund any order
              whose custom text violates these standards, at our discretion.
            </li>
          </ul>
          <Sub>License to produce your customization</Sub>
          <p>
            By submitting custom text, you grant us the right to manufacture the Product with
            that text and to store your build configuration so you can return to it later. You
            confirm you have the right to use any text you submit.
          </p>
        </Section>

        <Section title="Orders, Pricing &amp; Payment">
          <p>
            All prices are listed in U.S. dollars. Payment is processed by{" "}
            <strong style={strong}>Stripe</strong>; we never receive or store your full card
            details. Your order is an offer to purchase, which we accept when we send your
            order confirmation email.
          </p>
          <ul style={ulStyle}>
            <li>
              We may refuse or cancel any order — for example, for suspected fraud, pricing or
              listing errors, or custom text that violates these Terms. If we cancel a paid
              order, we will refund it in full.
            </li>
            <li>
              In the event of an obvious pricing error, we may cancel the affected order and
              refund you rather than fulfill it at the erroneous price.
            </li>
            <li>
              You are responsible for any applicable sales taxes shown at checkout.
            </li>
          </ul>
        </Section>

        <Section title="Shipping, Returns &amp; Refunds">
          <p>
            Shipping methods, delivery estimates, our 30-day return policy, and refund
            processing are described on our{" "}
            <a href="/policies" style={link}>Returns, Shipping &amp; FAQ</a> page, which is
            incorporated into these Terms. Risk of loss passes to you when we hand the package
            to the carrier, but if your order arrives damaged or defective, contact us and we
            will make it right as described in our return policy.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            The Site and its content — including our designs, 3D models, images, text, logos,
            and the BuckThatDuck name — are owned by Pleeter LLC or our licensors and are
            protected by intellectual property laws. You may not copy, reproduce, distribute,
            or create derivative works from the Site or our Product designs without our written
            permission. Purchasing a Product gives you ownership of that physical item, not of
            the underlying designs or models.
          </p>
          <Sub>No affiliation with Ford</Sub>
          <p>
            BuckThatDuck and Pleeter LLC are <strong style={strong}>not affiliated with,
            endorsed by, or sponsored by Ford Motor Company</strong>. Ford, Bronco, and related
            vehicle color names are trademarks of Ford Motor Company and are referenced on the
            Site only to describe the color themes that inspired our figurines.
          </p>
        </Section>

        <Section title="Acceptable Use of the Site">
          <p>You agree not to:</p>
          <ul style={ulStyle}>
            <li>Use the Site for any unlawful purpose or in violation of these Terms;</li>
            <li>Attempt to gain unauthorized access to the Site, other accounts, or our systems;</li>
            <li>Interfere with the Site&rsquo;s operation, including by introducing malware or placing fraudulent orders;</li>
            <li>Scrape, harvest, or copy Site content or data by automated means without our permission.</li>
          </ul>
        </Section>

        <Section title="Disclaimer of Warranties">
          <p>
            Except as expressly stated in these Terms or on our{" "}
            <a href="/policies" style={link}>Returns, Shipping &amp; FAQ</a> page, the Site and
            Products are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; and we
            disclaim all other warranties, express or implied, including implied warranties of
            merchantability, fitness for a particular purpose, and non-infringement. Some
            jurisdictions do not allow certain warranty disclaimers, so parts of this section
            may not apply to you.
          </p>
          <p>
            Our Products are decorative collectibles. They are{" "}
            <strong style={strong}>not toys for young children</strong> and may contain small
            parts.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, Pleeter LLC will not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising out of or
            relating to the Site or the Products. Our total liability for any claim will not
            exceed the amount you paid for the order giving rise to the claim. Some
            jurisdictions do not allow certain limitations of liability, so parts of this
            section may not apply to you.
          </p>
        </Section>

        <Section title="Indemnification">
          <p>
            You agree to indemnify and hold Pleeter LLC harmless from claims, damages, and
            expenses (including reasonable attorneys&rsquo; fees) arising from your violation
            of these Terms or your misuse of the Site, including any claim that custom text you
            submitted infringes another party&rsquo;s rights.
          </p>
        </Section>

        <Section title="Governing Law &amp; Disputes">
          <p>
            These Terms are governed by the laws of the State of{" "}
            <strong style={strong}>New Jersey</strong>, without regard to its conflict-of-law
            rules. Any dispute that cannot be resolved informally will be brought in the state
            or federal courts located in New Jersey, and you consent to their jurisdiction.
            Before filing any claim, please contact us — most issues can be resolved quickly
            and informally.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date
            above reflects the current version. Changes apply prospectively; the Terms in
            effect when you place an order govern that order. Continued use of the Site after
            changes take effect constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            Questions about these Terms? Reach us at{" "}
            <a href="mailto:orders@buckthatduck.com" style={link}>orders@buckthatduck.com</a>{" "}
            or by mail:
          </p>
          <p>
            Pleeter LLC<br />
            8 Nelke Ct<br />
            Hawthorne, NJ 07506<br />
            United States
          </p>
        </Section>

      </div>
    </main>
  );
}
