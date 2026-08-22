import { Link } from 'react-router-dom';
import { FileText, Compass, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
            Terms of Service · Revision 2026.1
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-[#16302B]">
            Terms of Service
          </h1>
          <p className="font-mono text-xs text-[#16302B]/60">
            Last updated: August 22, 2026 · Governing all access to GlobeTrotter planning tools and services.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-[#16302B]/12 bg-white/80 p-8 sm:p-10 shadow-sm backdrop-blur space-y-8 leading-relaxed">
          
          {/* Summary Box */}
          <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED]/60 p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif text-base font-semibold text-[#16302B]">
              <Compass className="size-5 text-[#E15B4F]" />
              Welcome to GlobeTrotter
            </div>
            <p className="text-xs text-[#16302B]/75 leading-relaxed">
              By accessing or using the GlobeTrotter web platform, you agree to comply with and be bound by these Terms of Service. Please review them carefully prior to generating routes or creating travel itineraries.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              1. Platform Services &amp; Purpose
            </h2>
            <p className="text-sm text-[#16302B]/75">
              GlobeTrotter provides web-based tools designed to assist travelers in organizing travel routes, creating day-by-day itineraries, estimating budgets, and exploring destination activities. GlobeTrotter is an informational and planning platform and does not act as an airline, hotel, or direct ticket vendor unless explicitly stated.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              2. User Accounts &amp; Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75">
              <li><strong>Account Security:</strong> You are responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
              <li><strong>Accurate Information:</strong> You agree to provide true, accurate, and current information during registration and trip planning.</li>
              <li><strong>Lawful Use:</strong> You agree not to use the platform for unlawful purposes, to distribute malicious content, or to disrupt the services of other travelers.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              3. Itinerary Estimates &amp; Travel Accuracy
            </h2>
            <p className="text-sm text-[#16302B]/75">
              While we strive to provide reliable and up-to-date city data, activity descriptions, cost indices, and travel suggestions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#16302B]/75">
              <li>Cost estimates, exchange rates, and activity durations are approximations provided for planning convenience.</li>
              <li>Actual travel costs, operating hours, visa requirements, and local restrictions may change. Travelers are responsible for verifying specific booking requirements with local providers.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              4. Community Guidelines &amp; Shared Content
            </h2>
            <p className="text-sm text-[#16302B]/75">
              Users may post reviews, share itineraries, and interact in the GlobeTrotter Community. Content that is offensive, fraudulent, infringing on intellectual property, or commercially promotional is strictly prohibited and subject to immediate removal.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              5. Intellectual Property
            </h2>
            <p className="text-sm text-[#16302B]/75">
              The GlobeTrotter name, branding, logos, software architecture, and interface designs are the intellectual property of GlobeTrotter and its developers. You retain ownership of personal itineraries and notes you create on the platform.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              6. Limitation of Liability
            </h2>
            <p className="text-sm text-[#16302B]/75">
              To the fullest extent permitted by law, GlobeTrotter and its contributors shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform, travel delays, pricing fluctuations, or reliance on itinerary estimates.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              7. Updates to Terms
            </h2>
            <p className="text-sm text-[#16302B]/75">
              We reserve the right to modify these Terms of Service at any time. Continued use of GlobeTrotter following the publication of revised terms constitutes your acceptance of the updated agreement.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#16302B]">
              8. Contact &amp; Support
            </h2>
            <p className="text-sm text-[#16302B]/75">
              For questions regarding these Terms of Service, please reach out to{' '}
              <a href="mailto:legal@globetrotter.dev" className="text-[#E15B4F] font-semibold hover:underline">
                legal@globetrotter.dev
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
