export default function AdLiteWebsite() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black font-sans">
      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b border-black/5 backdrop-blur-md sticky top-0 bg-[#f5f5f3]/90 z-50">
        <div className="text-2xl font-semibold tracking-tight">AdLite</div>

        <div className="hidden md:flex items-center gap-8 text-sm text-black/70">
          <a href="#how">How It Works</a>
          <a href="#why">Why AdLite</a>
          <a href="#locations">Locations</a>
          <a href="#contact">Contact</a>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-full text-sm hover:scale-105 transition-all">
          Book a Campaign
        </button>
      </nav>

      {/* HERO */}
      <section className="px-8 md:px-20 py-24 md:py-36">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white mb-8 text-sm shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Kampala’s street-level advertising network
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight mb-8">
              Paper bags that advertise for you.
            </h1>

            <p className="text-xl text-black/70 leading-relaxed max-w-xl mb-10">
              We turn everyday paper bags into moving billboards distributed through real shops, markets, pharmacies, salons, and takeaway points across Kampala.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-black text-white px-7 py-4 rounded-full text-sm hover:scale-105 transition-all shadow-xl">
                Start Your Campaign
              </button>

              <button className="bg-white border border-black/10 px-7 py-4 rounded-full text-sm hover:bg-black hover:text-white transition-all">
                View How It Works
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#d9d1c7] rounded-[40px] p-10 shadow-2xl rotate-[-3deg]">
              <div className="bg-[#b98b5e] rounded-[30px] h-[500px] flex flex-col justify-center items-center text-center px-8 shadow-inner">
                <div className="text-5xl font-semibold leading-tight tracking-tight text-black mb-8">
                  THIS BAG
                  <br />
                  IS AN AD.
                </div>

                <div className="text-black/60 text-lg max-w-xs leading-relaxed">
                  Your brand. Printed. Carried. Seen.
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-white rounded-3xl p-6 shadow-xl border border-black/5 max-w-xs">
              <div className="text-4xl font-semibold mb-2">2,350+</div>
              <div className="text-black/60 text-sm">
                Shops ready to distribute paper bags across Kampala.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="px-8 md:px-20 pb-24">
        <div className="max-w-6xl mx-auto border border-black/5 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold">8 mins</div>
              <div className="text-black/60 mt-2 text-sm">Average exposure time per bag</div>
            </div>

            <div>
              <div className="text-3xl font-semibold">15+</div>
              <div className="text-black/60 mt-2 text-sm">People reached by a single bag</div>
            </div>

            <div>
              <div className="text-3xl font-semibold">Reusable</div>
              <div className="text-black/60 mt-2 text-sm">Your ads keep moving after checkout</div>
            </div>

            <div>
              <div className="text-3xl font-semibold">Hyperlocal</div>
              <div className="text-black/60 mt-2 text-sm">Target specific neighborhoods</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-8 md:px-20 py-24 bg-black text-white rounded-t-[48px]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-20">
            <div className="text-sm uppercase tracking-[0.3em] text-white/50 mb-6">
              How It Works
            </div>

            <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
              Your brand goes where customers go.
            </h2>

            <p className="text-xl text-white/70 leading-relaxed">
              We make advertising physical again — through paper bags distributed at real checkout counters across the city.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Book a campaign",
                text: "Choose your locations, campaign size, and target audience.",
              },
              {
                number: "02",
                title: "We print your bags",
                text: "Your branding goes onto premium paper bags designed for visibility.",
              },
              {
                number: "03",
                title: "Shops distribute them",
                text: "Customers carry your message across markets, streets, taxis, homes, and offices.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-[32px] p-10 backdrop-blur-md"
              >
                <div className="text-white/40 text-sm mb-8">{item.number}</div>
                <h3 className="text-3xl font-semibold mb-5 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-white/70 leading-relaxed text-lg">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY ADLITE */}
      <section id="why" className="px-8 md:px-20 py-28 bg-black text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-white/50 mb-6">
              Why AdLite
            </div>

            <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-8">
              Not all ads go on billboards.
            </h2>

            <p className="text-xl text-white/70 leading-relaxed mb-8">
              Some go home with customers.
            </p>

            <div className="space-y-6 text-lg text-white/70">
              <div className="flex gap-4">
                <div className="text-white">•</div>
                <div>Ads that can’t be skipped, blocked, or scrolled past.</div>
              </div>

              <div className="flex gap-4">
                <div className="text-white">•</div>
                <div>Real-world visibility at checkout counters across Kampala.</div>
              </div>

              <div className="flex gap-4">
                <div className="text-white">•</div>
                <div>Street-level distribution with hyper-local targeting.</div>
              </div>

              <div className="flex gap-4">
                <div className="text-white">•</div>
                <div>Reusable packaging means repeated brand exposure.</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-[40px] p-10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-5">
                <div className="text-white/60">Digital Ads</div>
                <div className="text-red-400">Skipped</div>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-5">
                <div className="text-white/60">Billboards</div>
                <div className="text-yellow-400">Static</div>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-5">
                <div className="text-white/60">AdLite Bags</div>
                <div className="text-green-400">Carried</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="px-8 md:px-20 py-28 bg-[#f5f5f3]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-sm uppercase tracking-[0.3em] text-black/40 mb-6">
              Distribution Network
            </div>

            <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-8">
              We place your brand where real transactions happen.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Markets",
              "Rolex Stands",
              "Pharmacies",
              "Salons",
              "Retail Shops",
              "Takeaway Points",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-[28px] p-10 border border-black/5 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="text-2xl font-semibold tracking-tight mb-4">
                  {item}
                </div>

                <div className="text-black/60 leading-relaxed">
                  Everyday touchpoints with high customer movement and repeated visibility.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-20 py-28">
        <div className="max-w-6xl mx-auto bg-black text-white rounded-[48px] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="text-sm uppercase tracking-[0.3em] text-white/50 mb-6">
              Start Advertising
            </div>

            <h2 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight mb-8">
              Your next customer might carry your ad home.
            </h2>

            <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
              Launch your first AdLite campaign and put your brand directly into the hands of real shoppers.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-7 py-4 rounded-full text-sm hover:scale-105 transition-all">
                Book a Campaign
              </button>

              <button className="border border-white/20 px-7 py-4 rounded-full text-sm hover:bg-white hover:text-black transition-all">
                Talk to AdLite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="px-8 md:px-20 py-16 border-t border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="text-3xl font-semibold tracking-tight mb-4">
              AdLite
            </div>

            <div className="text-black/60 max-w-sm leading-relaxed">
              Turning paper bags into Kampala’s newest advertising network.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm">
            <div>
              <div className="font-semibold mb-4">Company</div>
              <div className="space-y-3 text-black/60">
                <div>How It Works</div>
                <div>Locations</div>
                <div>Campaigns</div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-4">Contact</div>
              <div className="space-y-3 text-black/60">
                <div>hello@adlite.ug</div>
                <div>+256 XXX XXX XXX</div>
                <div>Kampala, Uganda</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
