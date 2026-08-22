import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 lg:px-8 space-y-10">
        {/* Back Link & Header */}
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#16302B]/60 hover:text-[#E15B4F] transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/45">
            Legal Document · Revision 2026.1
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-[#16302B]">
            Privacy Policy
          </h1>
          <p className="font-mono text-xs text-[#16302B]/60">
            Last updated: August 22, 2026 · Effective immediately for all GlobeTrotter travelers.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-[#16302B]/12 bg-white/80 p-8 sm:p-10 shadow-sm backdrop-blur space-y-8 leading-relaxed">
          
          {/* Summary Box */}
          <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED]/60 p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif text-base font-semibold text-[#16302B]">
              <ShieldCheck className="size-5 text-[#E15B4F]" />
              Our Commitment to Your Privacy
            </div>
            <p className="text-xs text-[#16302B]/75 leading-relaxed">
              At GlobeTrotter, we value the trust you place in us when planning your journeys. This Privacy Policy details the types of personal information we collect, how it is safeguarded, and the control you have over your travel manifests and profile.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              1. Information We Collect
            </h2>
            <p className="text-sm text-[#16302B]/75">
              When you create an account, plan itineraries, or engage with the GlobeTrotter community, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75 font-sans">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
              <li><strong>Itinerary Data:</strong> Destinations, dates, city stops, scheduled activities, budget estimates, and personal travel notes.</li>
              <li><strong>Community Submissions:</strong> Reviews, shared itineraries, ratings, and travel feedback posted to public boards.</li>
              <li><strong>Technical Data:</strong> IP address, device type, browser information, and session cookies strictly necessary for service operation.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              2. How We Use Your Information
            </h2>
            <p className="text-sm text-[#16302B]/75">
              Your data is utilized strictly for trip planning and personalized service delivery:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75">
              <li>Generating optimized multi-city route suggestions and schedule timelines.</li>
              <li>Computing cost estimates and calculating per-stop budget metrics.</li>
              <li>Securing access to your travel manifests and account profile.</li>
              <li>Sending necessary transactional notices, route changes, or system status updates.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              3. Data Sharing &amp; Third Parties
            </h2>
            <p className="text-sm text-[#16302B]/75">
              <strong>We do not sell your personal data or itinerary manifests to advertisers.</strong> Information is only shared under the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75">
              <li><strong>With Collaborators:</strong> Co-travelers with whom you explicitly share access to your itinerary.</li>
              <li><strong>Service Providers:</strong> Trusted hosting, database, and authentication providers acting under strict confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> If required by applicable law, regulation, or legal proceedings.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              4. Data Security &amp; Retention
            </h2>
            <p className="text-sm text-[#16302B]/75">
              We employ industry-standard encryption (TLS/HTTPS), salted password hashing (bcrypt), and secure tokenized authentication (JWT) to safeguard your data. Itinerary records remain accessible for as long as your account remains active or until you choose to delete them.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              5. Your Rights &amp; Choices
            </h2>
            <p className="text-sm text-[#16302B]/75">
              You maintain full control over your information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75">
              <li>You may view, edit, or delete any trip or profile information directly from your Dashboard.</li>
              <li>You can request complete account deletion by contacting support.</li>
              <li>You may choose whether to publish itineraries publicly or keep them private.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              6. Contact Us
            </h2>
            <p className="text-sm text-[#16302B]/75">
              If you have any questions or privacy inquiries regarding GlobeTrotter, please reach out to our team at{' '}
              <a href="mailto:privacy@globetrotter.dev" className="text-[#E15B4F] font-semibold hover:underline">
                privacy@globetrotter.dev
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
