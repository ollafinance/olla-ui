import { LegalPage, Section, SubSection, Paragraph, List } from "@/features/legal/LegalPage";

const restrictedTerritories: Array<{ territory: string; authority: string }> = [
  { territory: "Afghanistan (Taliban-controlled)", authority: "UN, US, EU, UK" },
  { territory: "Belarus", authority: "US, EU, UK" },
  { territory: "Burma / Myanmar", authority: "US, EU, UK" },
  { territory: "Central African Republic", authority: "UN, US, EU, UK" },
  { territory: "Crimea (Ukraine – Russian-occupied)", authority: "US, EU, UK" },
  { territory: "Cuba", authority: "US" },
  { territory: "Democratic People's Republic of Korea (North Korea)", authority: "UN, US, EU, UK" },
  { territory: "Democratic Republic of the Congo", authority: "UN, US, EU, UK" },
  { territory: "Donetsk (Ukraine – Russian-occupied)", authority: "US, EU, UK" },
  { territory: "Ethiopia (targeted)", authority: "US, EU" },
  { territory: "Haiti", authority: "UN, US" },
  { territory: "Iran", authority: "UN, US, EU, UK" },
  { territory: "Iraq (targeted)", authority: "UN, US, EU, UK" },
  { territory: "Kherson (Ukraine – Russian-occupied)", authority: "US, EU, UK" },
  { territory: "Lebanon", authority: "UN, US, EU, UK" },
  { territory: "Libya", authority: "UN, US, EU, UK" },
  { territory: "Luhansk (Ukraine – Russian-occupied)", authority: "US, EU, UK" },
  { territory: "Mali", authority: "UN, US, EU, UK" },
  { territory: "Nicaragua", authority: "US, EU, UK" },
  { territory: "Russia", authority: "US, EU, UK" },
  { territory: "Somalia", authority: "UN, US, EU, UK" },
  { territory: "South Sudan", authority: "UN, US, EU, UK" },
  { territory: "Sudan", authority: "UN, US, EU, UK" },
  { territory: "Syria", authority: "UN, US, EU, UK" },
  { territory: "Venezuela (targeted sectors)", authority: "US, EU, UK" },
  { territory: "Yemen", authority: "UN, US, EU, UK" },
  { territory: "Zaporizhzhia (Ukraine – Russian-occupied)", authority: "US, EU, UK" },
  { territory: "Zimbabwe (targeted)", authority: "US, EU" },
];

export function TermsFeature() {
  return (
    <LegalPage title="Olla.finance Terms of Use" lastUpdated="April 2026">
      <Section title="1. Agreement to Terms">
        <Paragraph>
          These Terms of Use and any terms and conditions incorporated by reference (collectively,
          the "Terms") govern access to and use of the Olla.finance interface, website, and any
          services available at https://olla.finance (collectively, the "Interface") by each
          individual, entity, group, or association (collectively "User", "Users", "You") who
          views, interacts with, links to, or otherwise uses or derives any benefit from the
          Interface.
        </Paragraph>
        <Paragraph>
          The Interface is operated by Aztlán Labs B.V., a private limited liability company
          (besloten vennootschap met beperkte aansprakelijkheid) incorporated and registered in the
          Netherlands (the "Company", "we", "us", "our"). By using the Interface, you are entering
          into a legal agreement with Aztlán Labs B.V.
        </Paragraph>
        <Paragraph>
          By accessing, browsing, or using the Interface, or by acknowledging your agreement to the
          Terms on the Interface, you agree that you have read, understood, and consented to be
          bound by all of the Terms and the Privacy Notice, which are incorporated by reference
          herein.
        </Paragraph>
        <Paragraph>
          From time to time and at any time, the Terms may be changed, amended, or revised without
          prior notice or consultation. It is your responsibility to check these Terms periodically
          for changes. Your continued use of the Interface following the posting of any changes
          constitutes acceptance of those changes.
        </Paragraph>
      </Section>

      <Section title="2. About Olla.finance">
        <Paragraph>
          Olla.finance is a Liquid Staking Derivative (LSD) protocol that bridges Aztec Layer 2 and
          Ethereum Layer 1. The Interface provides a front-end graphical interface through which
          Users may interact with the underlying smart contracts deployed on Ethereum. The
          Interface is provided as a convenience only; the underlying protocol smart contracts are
          autonomous and operate independently of the Interface and its maintainers.
        </Paragraph>
        <Paragraph>
          Olla.finance is not a bank, broker, financial advisor, exchange, or investment company.
          The Interface does not custody, hold, or control any User assets at any time. All
          staking, depositing, and withdrawal actions are executed directly by Users via their own
          self-custodied wallets and are processed autonomously by smart contracts.
        </Paragraph>
      </Section>

      <Section title="3. Eligibility and User Representations">
        <Paragraph>By accessing or using the Interface, you represent and warrant that you:</Paragraph>
        <List>
          <li>Are at least 18 years of age (or the age of majority in your jurisdiction, if higher);</li>
          <li>Have full legal capacity and authority to enter into these Terms;</li>
          <li>
            Will comply with all applicable laws, rules, and regulations in your relevant
            jurisdiction, and that your use of the Interface does not violate or facilitate the
            violation of any applicable laws or regulations, or contribute to or facilitate any
            illegal activity;
          </li>
          <li>Are not accessing the Interface from a Restricted Territory (as defined in Section 5 below);</li>
          <li>Are not a Prohibited Person (as defined in Section 5 below);</li>
          <li>
            Are not subject to any sanctions, embargoes, or other restrictive measures imposed by
            any Sanctioning Authority (as defined in Section 5 below);
          </li>
          <li>
            Are not acting on behalf of any person or entity located in, organised in, or a citizen
            or resident of a Restricted Territory;
          </li>
          <li>
            Are knowledgeable, experienced, and sophisticated in using and evaluating blockchain
            and related technologies and assets, including blockchains, tokens, and proof-of-stake
            smart contract systems;
          </li>
          <li>
            Have conducted your own thorough and independent investigation and analysis of the
            Interface and the protocol, and have not relied upon any information, statement,
            omission, representation, or warranty, express or implied, made by or on behalf of
            Olla.finance in connection with your decision to use the Interface;
          </li>
          <li>
            Understand that staking activities carry financial risk, including potential partial or
            total loss of staked assets.
          </li>
        </List>
      </Section>

      <Section title="4. Prohibited Uses">
        <Paragraph>You agree that you will not use the Interface to:</Paragraph>
        <List>
          <li>Violate any applicable law, rule, or regulation in any jurisdiction;</li>
          <li>
            Engage in any act or practice that operates to circumvent any sanctions, embargoes, or
            export controls targeting you or the country or territory where you are located;
          </li>
          <li>
            Engage in any activity that infringes upon or violates any copyright, trademark,
            service mark, patent, right of publicity, right of privacy, or other proprietary or
            intellectual property rights under applicable law;
          </li>
          <li>
            Engage in any activity that disguises or interferes in any way with the IP address of a
            device used to access the Interface, or that otherwise prevents the correct
            identification of the origin of the request (including use of VPNs or proxies for the
            purpose of circumventing geographic restrictions);
          </li>
          <li>
            Engage in market manipulation, wash trading, spoofing, or other tactics that violate
            applicable laws concerning the integrity of trading markets;
          </li>
          <li>
            Engage in token-based or other financings of a business, venture, DAO, software
            development project, or other initiative, including ICOs, IEOs, or similar token-based
            fundraising events, through or in connection with the Interface, where such activities
            are not compliant with applicable law;
          </li>
          <li>
            Engage in any activity that could damage, disable, overburden, or impair the Interface
            or its underlying infrastructure;
          </li>
          <li>
            Engage, attempt, or assist in any hack or attack on the Interface, any wallet
            application, or any related device, including any sybil attack, DoS attack, griefing
            attack, virus deployment, or theft;
          </li>
          <li>
            Use the Interface in any manner that could constitute, facilitate, or support money
            laundering, terrorist financing, or any other form of financial crime;
          </li>
          <li>
            Impersonate any person or entity or misrepresent your affiliation with any person or
            entity.
          </li>
        </List>
      </Section>

      <Section title="5. Restricted Territories and Prohibited Persons">
        <SubSection title="5.1 Definitions">
          <Paragraph>
            "Sanctioning Authorities" means the United States of America (including the Office of
            Foreign Assets Control, "OFAC"), the United Kingdom, the European Union and each of its
            member states, the United Nations, and any other governmental authority that
            administers economic sanctions, embargoes, or equivalent restrictive measures.
          </Paragraph>
          <Paragraph>
            "Restricted Territories" means any country, region, or territory that is subject to
            comprehensive sanctions, embargoes, or equivalent restrictive measures imposed by any
            Sanctioning Authority, including but not limited to:
          </Paragraph>
          <div className="overflow-x-auto">
            <table className="border-card-foreground/20 w-full border-collapse border text-sm">
              <thead className="bg-card-foreground/5">
                <tr>
                  <th className="border-card-foreground/20 text-card-foreground border px-3 py-2 text-left font-semibold">
                    Territory
                  </th>
                  <th className="border-card-foreground/20 text-card-foreground border px-3 py-2 text-left font-semibold">
                    Primary Sanctioning Authority
                  </th>
                </tr>
              </thead>
              <tbody>
                {restrictedTerritories.map((row) => (
                  <tr key={row.territory}>
                    <td className="border-card-foreground/20 text-card-foreground/80 border px-3 py-2">
                      {row.territory}
                    </td>
                    <td className="border-card-foreground/20 text-card-foreground/80 border px-3 py-2">
                      {row.authority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paragraph>
            This list is non-exhaustive and is updated periodically. Users are responsible for
            ensuring their jurisdiction is not subject to any applicable sanctions or embargoes,
            whether or not it appears on this list. When in doubt, do not use the Interface.
          </Paragraph>
          <Paragraph>"Prohibited Person" means any individual or entity that:</Paragraph>
          <List>
            <li>Is a resident, citizen, national, or agent of any Restricted Territory;</li>
            <li>Is incorporated, organised, or doing business in any Restricted Territory;</li>
            <li>
              Is listed on any sanctions list, denied-persons list, entity list, or equivalent list
              maintained by any Sanctioning Authority, including but not limited to OFAC's
              Specially Designated Nationals (SDN) list, the EU Consolidated Sanctions List, or the
              UK Financial Sanctions List;
            </li>
            <li>
              Directly or indirectly owns or controls, or has received assets from, any blockchain
              address that is listed on any such sanctions list or equivalent.
            </li>
          </List>
        </SubSection>
        <SubSection title="5.2 Access Restriction">
          <Paragraph>
            Access to the Interface by Prohibited Persons or from Restricted Territories is
            strictly prohibited. Olla.finance reserves the right to restrict or block access to the
            Interface from any jurisdiction at its sole discretion, without prior notice, in order
            to comply with applicable laws and regulations. The Interface may use technical
            measures, including IP address detection, to identify and restrict access from
            Restricted Territories. The use of VPNs, proxies, or other means to circumvent these
            restrictions constitutes a breach of these Terms.
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="6. Assumption of Risk">
        <Paragraph>By using the Interface, you acknowledge and accept the following risks:</Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Smart Contract Risk.</strong> The Olla.finance
          protocol is governed by smart contracts. Despite audits and ongoing security measures,
          smart contracts may contain bugs, vulnerabilities, or unintended behaviours that could
          result in the partial or total loss of staked assets.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Slashing Risk.</strong> Assets staked through the
          protocol are delegated to Ethereum validators. Validator misconduct or technical failures
          may result in slashing penalties, reducing the value of staked assets.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Liquidity Risk.</strong> LSD tokens representing
          staked positions may not always be redeemable at face value, particularly during periods
          of market stress or low liquidity.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Regulatory Risk.</strong> The legal and regulatory
          treatment of digital assets, liquid staking, and related activities is evolving and
          varies significantly by jurisdiction. Users are solely responsible for ensuring their use
          of the Interface complies with all applicable laws in their jurisdiction.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Bridge and Cross-Layer Risk.</strong> Because
          Olla.finance operates across Aztec Layer 2 and Ethereum Layer 1, there are additional
          risks associated with cross-layer messaging, bridge security, and settlement finality.
          Delays, failures, or exploits at either layer may affect the availability or value of
          assets.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Market Risk.</strong> The value of tokens, LSD
          positions, and staking rewards may fluctuate significantly. Past performance is not
          indicative of future results. No guarantee of return is made.
        </Paragraph>
        <Paragraph>
          <strong className="text-card-foreground">Protocol Upgrade Risk.</strong> The protocol may be
          upgraded or modified by governance processes. Such changes may affect token
          functionality, reward mechanics, or user positions.
        </Paragraph>
        <Paragraph>
          You are solely responsible for evaluating and assuming these risks. Olla.finance does not
          provide investment advice, and nothing on the Interface constitutes a recommendation to
          stake, hold, or transact in any asset.
        </Paragraph>
      </Section>

      <Section title="7. No Warranty">
        <Paragraph>
          THE INTERFACE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF
          ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW,
          OLLA.FINANCE AND ITS CONTRIBUTORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
          BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </Paragraph>
        <Paragraph>
          OLLA.FINANCE DOES NOT WARRANT THAT THE INTERFACE WILL BE UNINTERRUPTED, ERROR-FREE, OR
          FREE OF HARMFUL COMPONENTS, OR THAT ANY DEFECTS WILL BE CORRECTED.
        </Paragraph>
      </Section>

      <Section title="8. Limitation of Liability">
        <Paragraph>
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OLLA.FINANCE, ITS
          CONTRIBUTORS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF
          DATA, LOSS OF GOODWILL, OR ANY OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION
          WITH YOUR USE OF OR INABILITY TO USE THE INTERFACE, EVEN IF OLLA.FINANCE HAS BEEN ADVISED
          OF THE POSSIBILITY OF SUCH DAMAGES.
        </Paragraph>
        <Paragraph>
          IN NO EVENT SHALL THE AGGREGATE LIABILITY OF OLLA.FINANCE TO YOU FOR ALL CLAIMS ARISING
          OUT OF OR RELATING TO THE USE OF THE INTERFACE EXCEED THE GREATER OF (A) THE FEES, IF
          ANY, PAID BY YOU TO OLLA.FINANCE IN THE THREE (3) MONTHS PRECEDING THE CLAIM, OR (B) ONE
          HUNDRED US DOLLARS (USD $100).
        </Paragraph>
      </Section>

      <Section title="9. Indemnification">
        <Paragraph>
          You agree to defend, indemnify, and hold harmless Olla.finance, its contributors,
          developers, officers, agents, and affiliates from and against any claims, damages,
          losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of
          or relating to: (a) your use of the Interface; (b) your violation of these Terms; (c)
          your violation of any rights of a third party; or (d) your violation of any applicable
          law or regulation.
        </Paragraph>
      </Section>

      <Section title="10. Intellectual Property">
        <Paragraph>
          All content, code, and materials comprising the Interface are the property of
          Olla.finance or its licensors and are protected by applicable intellectual property laws.
          You are granted a limited, non-exclusive, non-transferable, revocable licence to access
          and use the Interface solely for its intended purpose in accordance with these Terms. You
          may not copy, reproduce, modify, distribute, or create derivative works from any part of
          the Interface without express written consent.
        </Paragraph>
      </Section>

      <Section title="11. Data Collection and Privacy">
        <Paragraph>
          The Interface may directly or indirectly collect and temporarily store technical data for
          operational purposes, including for the purpose of identifying IP addresses or blockchain
          addresses that may indicate use of the Interface from Restricted Territories or by
          Prohibited Persons. Such data is handled in accordance with our Privacy Notice. Except
          as required by applicable law, the Interface maintainers have no obligation of
          confidentiality with respect to information collected for compliance purposes.
        </Paragraph>
      </Section>

      <Section title="12. Third-Party Links and Services">
        <Paragraph>
          The Interface may contain links to third-party websites, protocols, or services.
          Olla.finance does not endorse and is not responsible for the content, privacy practices,
          or terms of any third-party services. Your use of third-party services is at your own
          risk and subject to the terms of those services.
        </Paragraph>
      </Section>

      <Section title="13. Modifications and Termination">
        <Paragraph>
          Olla.finance reserves the right to modify, suspend, or discontinue the Interface at any
          time, with or without notice, for any reason, including to comply with applicable laws
          and regulations. Olla.finance shall have no liability to you or any third party for any
          such modification, suspension, or discontinuation.
        </Paragraph>
      </Section>

      <Section title="14. Governing Law and Dispute Resolution">
        <Paragraph>
          These Terms shall be governed by and construed in accordance with applicable law. Any
          disputes arising under or in connection with these Terms shall be resolved through
          binding arbitration conducted on an individual basis. You waive any right to participate
          in a class action lawsuit or class-wide arbitration. Nothing in this section limits
          either party's ability to seek emergency injunctive relief from a competent court where
          necessary to prevent irreparable harm.
        </Paragraph>
      </Section>

      <Section title="15. Severability">
        <Paragraph>
          If any provision of these Terms is found by a competent court or arbitrator to be
          invalid, illegal, or unenforceable, that provision shall be severed and the remaining
          provisions shall continue in full force and effect.
        </Paragraph>
      </Section>

      <Section title="16. Entire Agreement">
        <Paragraph>
          These Terms, together with the Privacy Notice and any other documents incorporated by
          reference, constitute the entire agreement between you and Olla.finance with respect to
          the Interface and supersede all prior agreements, representations, and understandings.
        </Paragraph>
      </Section>

      <Section title="17. Contact">
        <Paragraph>For questions or concerns regarding these Terms, please contact:</Paragraph>
        <Paragraph>
          Olla.finance Email:{" "}
          <a href="mailto:legal@olla.finance" className="text-card-foreground font-medium hover:underline">
            legal@olla.finance
          </a>
        </Paragraph>
      </Section>
    </LegalPage>
  );
}
