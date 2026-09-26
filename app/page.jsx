import MarketingHeader from '@/components/MarketingHeader';
import MarketingFooter from '@/components/MarketingFooter';
import StoreLocator from '@/components/StoreLocator';

export default function HomePage() {
  return (
    <>
      <MarketingHeader />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">FRESH · FAST · FOLDED</span>
            <h1>
              Clean clothes,
              <br />
              zero hassle.
            </h1>
            <p>
              Dry cleaning, wash &amp; fold, wash &amp; iron, ironing and shoe cleaning — booked in a tap, picked up at
              your door, delivered fresh.
            </p>
            <div className="hero-actions">
              <a href="/login" className="btn btn-primary btn-lg">
                Login to Book a Pickup
              </a>
              <a href="#locate" className="btn btn-outline btn-lg">
                Find Nearest Store
              </a>
            </div>
            <div className="hero-trust">
              <span className="stars">★★★★★</span>
              <span>Loved by neighbourhoods across the city</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 420 420" className="illo">
              <circle cx="210" cy="210" r="200" fill="var(--navy-050)" />
              <line x1="80" y1="90" x2="340" y2="90" stroke="var(--navy)" strokeWidth="6" strokeLinecap="round" />
              <path d="M210 90 L210 60" stroke="var(--navy)" strokeWidth="6" strokeLinecap="round" />
              <path
                d="M120 90 L210 150 L300 90"
                stroke="var(--navy)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M150 150 C150 260 130 300 110 330 L310 330 C290 300 270 260 270 150 Z"
                fill="var(--cream)"
                stroke="var(--navy)"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <rect x="60" y="250" width="140" height="110" rx="14" fill="var(--cream)" stroke="var(--orange)" strokeWidth="6" />
              <circle cx="130" cy="305" r="34" fill="none" stroke="var(--navy)" strokeWidth="6" />
              <circle cx="130" cy="305" r="18" fill="none" stroke="var(--orange)" strokeWidth="4" />
              <circle cx="80" cy="268" r="4" fill="var(--navy)" />
              <circle cx="95" cy="268" r="4" fill="var(--navy)" />
            </svg>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">OUR SERVICES</span>
            <h2>Everything your wardrobe needs</h2>
          </div>
          <div className="service-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 64 64">
                  <path d="M32 8c-4 6-10 10-10 20a10 10 0 0020 0c0-10-6-14-10-20z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M18 48h28l-3 10H21z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Dry Cleaning</h3>
              <p>Gentle, precise care for delicate and special-occasion fabrics.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 64 64">
                  <rect x="10" y="12" width="44" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="32" cy="36" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M25 36c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  <circle cx="18" cy="20" r="2" fill="currentColor" />
                </svg>
              </div>
              <h3>Wash &amp; Fold</h3>
              <p>Everyday laundry washed, dried and neatly folded, ready to wear.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 64 64">
                  <path d="M14 22h30l6 8-6 4H14z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M20 34v10M40 30v12" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <h3>Wash &amp; Iron</h3>
              <p>Washed clean and pressed crisp — the complete finish in one order.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 64 64">
                  <path d="M12 40h26l10-8V22H26z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M12 40c0 6 6 6 6 0" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h3>Ironing</h3>
              <p>Wrinkle-free, sharp-creased garments pressed by trained hands.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 64 64">
                  <path d="M10 44c0-8 6-10 12-14 4-3 6-6 10-6h8c6 0 10 4 14 6l-2 14z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M10 44h44" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <h3>Shoe Cleaning</h3>
              <p>Restoring shine and freshness to sneakers, leather and suede alike.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="usp">
        <div className="container usp-grid">
          <div className="usp-item">
            <div className="usp-icon">📅</div>
            <h3>Convenient Booking</h3>
            <p>Schedule your order in under a minute, from web or phone.</p>
          </div>
          <div className="usp-item">
            <div className="usp-icon">⚡</div>
            <h3>Quick Turnaround</h3>
            <p>Fast, reliable service delivery — clothes back when you need them.</p>
          </div>
          <div className="usp-item">
            <div className="usp-icon">🚚</div>
            <h3>Pickup &amp; Drop</h3>
            <p>We collect and return, right at your doorstep, every time.</p>
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Four simple steps</h2>
          </div>
          <div className="steps-grid">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Schedule</h3>
              <p>Book your pickup slot online in seconds.</p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Pickup</h3>
              <p>Our team collects at your chosen time.</p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Clean</h3>
              <p>Expert care, tailored to every fabric.</p>
            </div>
            <div className="step">
              <span className="step-num">04</span>
              <h3>Deliver</h3>
              <p>Fresh, folded laundry back at your door.</p>
            </div>
          </div>
          <div className="how-cta">
            <a href="/login" className="btn btn-primary btn-lg">
              Login to Book a Pickup
            </a>
          </div>
        </div>
      </section>

      <section id="locate" className="locator">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">LOCATE A STORE</span>
            <h2>Find your nearest Laundrylanes</h2>
            <p className="section-sub">Search your area or use your location to find the closest store and get directions.</p>
          </div>
          <StoreLocator />
        </div>
      </section>

      <section id="about" className="about">
        <div className="container about-inner">
          <div className="about-copy">
            <span className="eyebrow">ABOUT LAUNDRYLANES</span>
            <h2>Care you can trust, convenience you&apos;ll love</h2>
            <p>
              Every garment gets the attention it deserves. Our trained specialists pair modern equipment with careful
              handling, so your clothes come back looking — and feeling — their best.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat">
              <strong>4.9★</strong>
              <span>Average Rating</span>
            </div>
            <div className="stat">
              <strong>24–48h</strong>
              <span>Turnaround</span>
            </div>
            <div className="stat">
              <strong>Free</strong>
              <span>Pickup &amp; Drop</span>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">TESTIMONIALS</span>
            <h2>What our customers say</h2>
          </div>
          <div className="testimonial-grid">
            <blockquote className="testimonial">
              <p>&ldquo;Booking took a minute and the pickup was right on time. Clothes came back spotless.&rdquo;</p>
              <footer>— Happy Customer</footer>
            </blockquote>
            <blockquote className="testimonial">
              <p>&ldquo;The wash &amp; iron service is a lifesaver on busy weeks. Consistently great quality.&rdquo;</p>
              <footer>— Happy Customer</footer>
            </blockquote>
            <blockquote className="testimonial">
              <p>&ldquo;My sneakers looked brand new after their shoe cleaning service. Highly recommend.&rdquo;</p>
              <footer>— Happy Customer</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section id="booking" className="final-cta">
        <div className="container final-cta-inner">
          <h2>Ready to skip laundry day?</h2>
          <p>Free pickup &amp; drop. Schedule your first order in under a minute.</p>
          <a href="/login" className="btn btn-primary btn-lg">
            Login to Book a Pickup
          </a>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
