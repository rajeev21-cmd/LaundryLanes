import Image from 'next/image';

export default function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/logo.webp" alt="Laundrylanes logo" width={120} height={60} className="footer-logo" />
          <p>Dry cleaning and laundry, delivered with care.</p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <a href="#services">Dry Cleaning</a>
          <a href="#services">Wash &amp; Fold</a>
          <a href="#services">Wash &amp; Iron</a>
          <a href="#services">Ironing</a>
          <a href="#services">Shoe Cleaning</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#about">About Us</a>
          <a href="#locate">Locate a Store</a>
          <a href="/login">Login</a>
        </div>
        <div className="footer-col">
          <h4>Get in Touch</h4>
          <a href="tel:+910000000000">+91 00000 00000</a>
          <a href="mailto:hello@laundrylanes.com">hello@laundrylanes.com</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Laundrylanes. All rights reserved.</span>
      </div>
    </footer>
  );
}
