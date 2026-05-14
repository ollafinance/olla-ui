import { LegalPage, Section, Paragraph, List } from "@/features/legal/LegalPage";

const dataTable: Array<{ purpose: string; data: string; basis: string }> = [
  {
    purpose: "Providing and operating the Services",
    data: "Technical interaction data (see Cookies section)",
    basis: "Legitimate interests",
  },
  {
    purpose: "Improving website performance and user experience",
    data: "Anonymised and aggregated analytics data",
    basis: "Legitimate interests",
  },
  {
    purpose: "Responding to support requests or enquiries",
    data: "Email address, content of your message",
    basis: "Contractual necessity / Legitimate interests",
  },
  {
    purpose: "Security and fraud prevention",
    data: "Technical logs (short retention, see below)",
    basis: "Legitimate interests",
  },
];

export function PrivacyFeature() {
  return (
    <LegalPage title="Olla.finance Privacy Notice" lastUpdated="April 2026">
      <Section title="Introduction">
        <Paragraph>
          This Privacy Notice (the "Privacy Notice") explains how the personal data of individuals
          is handled — referred to as "Data Subjects", "you", or "your" — in connection with
          accessing and using the website and any services available from https://olla.finance
          (together referred to as the "Services").
        </Paragraph>
        <Paragraph>
          Olla.finance is a Liquid Staking Derivative (LSD) on Ethereum Layer1, which helps secure the
          L2 Aztec network. All interactions with Olla contracts are done on L1 using either the
          stAztec or AZTEC token. This means that the staking contract interactions (on Layer 1)
          are recorded on the public Ethereum blockchain and are not private by default. This
          Privacy Notice addresses the limited off-chain data we may collect through your use of
          our website and interface, and does not govern publicly visible on-chain activity.
        </Paragraph>
        <Paragraph>
          If you are interested in how cookies are used, please refer to the section "Cookies and
          Automatically Collected Data" below.
        </Paragraph>
        <Paragraph>
          If you are a resident of the European Economic Area (EEA) and under the age of 16, please
          do not submit any personal data through the Services or website.
        </Paragraph>
      </Section>

      <Section title="Categories of Personal Data Collected and Purposes">
        <Paragraph>
          When providing the Services, certain personal data may be processed for the following
          purposes:
        </Paragraph>
        <div className="overflow-x-auto">
          <table className="border-card-foreground/20 w-full border-collapse border text-sm">
            <thead className="bg-card-foreground/5">
              <tr>
                <th className="border-card-foreground/20 text-card-foreground border px-3 py-2 text-left font-semibold">
                  Purpose
                </th>
                <th className="border-card-foreground/20 text-card-foreground border px-3 py-2 text-left font-semibold">
                  Personal Data
                </th>
                <th className="border-card-foreground/20 text-card-foreground border px-3 py-2 text-left font-semibold">
                  Legal Basis
                </th>
              </tr>
            </thead>
            <tbody>
              {dataTable.map((row) => (
                <tr key={row.purpose}>
                  <td className="border-card-foreground/20 text-card-foreground/80 border px-3 py-2">
                    {row.purpose}
                  </td>
                  <td className="border-card-foreground/20 text-card-foreground/80 border px-3 py-2">
                    {row.data}
                  </td>
                  <td className="border-card-foreground/20 text-card-foreground/80 border px-3 py-2">
                    {row.basis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paragraph>
          Your personal data is collected directly from you or from other parties that you have
          authorised such collection from. There is no process for special categories of personal
          data about you unless you voluntarily provide such data.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Note on blockchain data:</strong> The staking
          contracts that settle on Ethereum Layer 1 are publicly visible on the Ethereum
          blockchain. Olla.finance does not receive or process your wallet addresses in any way
          that links them to your off-chain identity.
        </Paragraph>
      </Section>

      <Section title="Cookies and Automatically Collected Data">
        <Paragraph>
          Olla.finance will never write or collect cookies for analytics reasons. Cookies are used
          solely for functional purposes — for example, to record your acknowledgment of this
          privacy banner on our website.
        </Paragraph>
        <Paragraph>
          We use a cookieless web analytics tool to collect essential, anonymised analytics on user
          behaviour and interactions. This information is collected automatically and may include:
        </Paragraph>
        <List>
          <li>Statistical and performance data arising from your use of the Services</li>
          <li>Traffic data and logs, page views, length of visit, and website navigation paths</li>
        </List>
        <Paragraph>
          IP address information is not written into any analytics database, and Geo-IP is not used
          to detect user location.
        </Paragraph>
        <Paragraph>
          Analytical data collected in this manner is anonymised and aggregated before any storage
          or analysis. It cannot be used to identify you as an individual.
        </Paragraph>
      </Section>

      <Section title="Your Rights With Regard to Personal Data">
        <Paragraph>
          Depending on your jurisdiction, you may have the following rights in relation to your
          personal data:
        </Paragraph>
        <List>
          <li>
            <strong className="text-card-foreground">Right of access</strong> — to obtain a copy of your
            personal data we hold
          </li>
          <li>
            <strong className="text-card-foreground">Right to rectification</strong> — to correct
            inaccurate or incomplete data
          </li>
          <li>
            <strong className="text-card-foreground">Right to erasure</strong> — to request deletion of
            your personal data
          </li>
          <li>
            <strong className="text-card-foreground">Right to restriction</strong> — to request we limit
            how we process your data
          </li>
          <li>
            <strong className="text-card-foreground">Right to data portability</strong> — to receive
            your data in a structured, machine-readable format
          </li>
          <li>
            <strong className="text-card-foreground">Right to object</strong> — to object to processing
            based on legitimate interests
          </li>
          <li>
            <strong className="text-card-foreground">Right to withdraw consent</strong> — where
            processing is based on consent, to withdraw it at any time
          </li>
        </List>
        <Paragraph>
          To exercise any of these rights, please contact us at the address in the "Contacts"
          section below. We will respond within 30 days.
        </Paragraph>
        <Paragraph>
          Residents of the European Economic Area may also lodge a complaint with their local
          supervisory authority.
        </Paragraph>
      </Section>

      <Section title="Personal Data Storage and Retention">
        <Paragraph>
          We retain personal data only for as long as necessary to fulfil the purposes described in
          this Notice:
        </Paragraph>
        <List>
          <li>
            <strong className="text-card-foreground">Technical logs (if any):</strong> erased on a
            rolling daily basis after readout for security analysis
          </li>
          <li>
            <strong className="text-card-foreground">Support correspondence:</strong> retained for as
            long as necessary to resolve your enquiry and for a reasonable period thereafter
          </li>
          <li>
            <strong className="text-card-foreground">Anonymised analytics data:</strong> retained
            indefinitely in aggregated, non-identifiable form
          </li>
        </List>
        <Paragraph>
          Once the retention period expires, personal data is securely deleted or anonymised.
        </Paragraph>
      </Section>

      <Section title="Personal Data Recipients">
        <Paragraph>
          Olla.finance does not sell, rent, or trade your personal data. We may share data with
          trusted third-party service providers strictly to operate the Services, including:
        </Paragraph>
        <List>
          <li>Hosting and infrastructure providers (for website and interface delivery)</li>
          <li>Cookieless analytics providers (receiving only anonymised, aggregated data)</li>
          <li>Legal and compliance advisors where required by law</li>
        </List>
        <Paragraph>
          All third-party recipients are contractually required to process data only for the
          purposes for which it was shared and to maintain appropriate security standards.
        </Paragraph>
        <Paragraph>
          We may also disclose personal data where required to do so by applicable law, regulation,
          or legal process, or to protect the rights, property, or safety of Olla.finance, its
          users, or others.
        </Paragraph>
      </Section>

      <Section title="Security of Processing">
        <Paragraph>
          We implement appropriate technical and organisational measures to protect personal data
          against unauthorised access, alteration, disclosure, or destruction. These measures are
          reviewed and updated periodically.
        </Paragraph>
        <Paragraph>
          Staking contract interactions that settle on Ethereum Layer 1 are publicly visible
          on-chain, as is standard for all Ethereum-based protocols. Neither layer exposes your
          off-chain identity through normal use of the protocol.
        </Paragraph>
        <Paragraph>
          However, no method of transmission over the internet or electronic storage is 100%
          secure. While we strive to protect your data, we cannot guarantee absolute security.
        </Paragraph>
      </Section>

      <Section title="Changes to This Privacy Notice">
        <Paragraph>
          We may update this Privacy Notice from time to time. When we make material changes, we
          will post a notice on our website. Your continued use of the Services after any changes
          constitutes your acceptance of the updated Privacy Notice. We encourage you to review
          this page periodically.
        </Paragraph>
      </Section>

      <Section title="Contacts and Requests">
        <Paragraph>
          For any questions, requests, or concerns regarding this Privacy Notice or the processing
          of your personal data, please contact us at:
        </Paragraph>
        <Paragraph>
          Olla.finance Email:{" "}
          <a href="mailto:privacy@olla.finance" className="text-card-foreground font-medium hover:underline">
            privacy@olla.finance
          </a>
        </Paragraph>
        <Paragraph>
          We will acknowledge your request promptly and respond within 30 days.
        </Paragraph>
      </Section>
    </LegalPage>
  );
}
