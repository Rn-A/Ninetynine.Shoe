"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';
import { apiFetchJsonArray, getUploadUrl } from '@/lib/api';

export default function Home() {
  const { user, categories: services, loadingServices: loading } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<any[]>([]);

  const getMediaUrl = getUploadUrl;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCmsData = () => {
      apiFetchJsonArray('/api/testimonials').then(setTestimonials).catch(() => { });
      apiFetchJsonArray('/api/showcase').then(setShowcaseItems).catch(() => { });
    };

    // Fetch immediately when page loads
    fetchCmsData();

    // Re-fetch when user switches BACK to this browser tab (e.g. from admin tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCmsData();
    };

    // Re-fetch when user returns from another app to browser
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchCmsData);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchCmsData);
    };
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-montserrat">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300" style={{ background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', boxShadow: isScrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="font-bebas text-2xl text-slate-800 tracking-wider flex items-center gap-2">
            <img src="/uploads/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <Link href="/">Ninetynine <span className="text-primary">Shoe</span></Link>
          </div>
          <ul className="hidden lg:flex gap-8 items-center">
            {!user && <li><Link href="/tracking" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors"><i className="fa-solid fa-magnifying-glass mr-1"></i> Lacak Resi</Link></li>}
            <li><a href="#about" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors">About</a></li>
            <li><a href="#shoes" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors">Daftar Harga</a></li>
            <li><a href="#testimonials" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors">Testimoni</a></li>
            <li><a href="#contact" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors">Lokasi</a></li>
          </ul>
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link href={user.role === 'admin' ? "/admin" : "/my-orders"} className="font-bold text-sm text-slate-800 hover:text-primary transition-colors">
                {user.role === 'admin' ? "Dashboard Admin" : "Pesanan Saya"}
              </Link>
            ) : (
              <Link href="/auth" className="font-medium text-sm text-slate-800 hover:text-primary transition-colors">Login / Daftar</Link>
            )}
            <Link href="/order" className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">Pesan Antar</Link>
          </div>
          <div className="lg:hidden text-2xl cursor-pointer text-slate-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[70px] left-0 w-full bg-white p-6 shadow-lg z-40 flex flex-col gap-4 items-center lg:hidden border-t border-slate-100">
          {!user && <Link href="/tracking" className="font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}><i className="fa-solid fa-magnifying-glass mr-1"></i> Lacak Resi</Link>}
          <a href="#about" className="font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#shoes" className="font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>Daftar Harga</a>
          <a href="#testimonials" className="font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>Testimoni</a>
          <a href="#contact" className="font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>Lokasi</a>
          <div className="w-full flex flex-col mt-4 border-t border-slate-100 pt-4 gap-4">
            {user ? (
              <Link href={user.role === 'admin' ? "/admin" : "/my-orders"} className="text-center font-bold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>
                {user.role === 'admin' ? "Dashboard Admin" : "Pesanan Saya"}
              </Link>
            ) : (
              <Link href="/auth" className="text-center font-semibold text-lg text-slate-800" onClick={() => setMobileMenuOpen(false)}>Login / Daftar</Link>
            )}
            <Link href="/order" className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-md text-center" onClick={() => setMobileMenuOpen(false)}>Pesan Antar</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="absolute top-[-100px] left-[-200px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="text-center lg:text-left">
          <h1 className="font-bebas text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-slate-800 leading-none mb-6">
            EVERYDAY<br /><span className="text-primary">CLEAN DAY.</span>
          </h1>
          <p className="text-slate-500 text-lg sm:text-xl mb-8 max-w-2xl mx-auto lg:mx-0">
            Tukang cuci sepatu andalan Anda. Pencetus cuci sepatu sambil tiduran di Indonesia! Bersih menyeluruh, higienis, dan pengerjaan cepat.
          </p>
          <div className="mb-10">
            <Link href="/order" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Pesan Antar Sekarang
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4 font-medium text-slate-600">
            <div className="flex -space-x-3">
              <img src="/uploads/profile1.png" alt="Customer 1" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="/uploads/profile2.png" alt="Customer 2" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="/uploads/profile3.png" alt="Customer 3" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <span>Ribuan Sepatu telah dibersihkan</span>
          </div>
        </div>
        {/* Outer wrapper carries the float animation - overflow:hidden is NOT here */}
        <div className="relative w-full h-[400px] sm:h-[500px] animate-float [filter:drop-shadow(0_30px_40px_rgba(37,99,235,0.25))]">
          {/* Inner div: has overflow-hidden for border-radius clipping */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-slate-200 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/uploads/Banner.png')" }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <span className="relative z-10 text-white font-bold text-xl tracking-wider drop-shadow-md"></span>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="w-full bg-primary text-white py-4 overflow-hidden shadow-md">
        <div className="flex animate-marquee whitespace-nowrap font-bebas tracking-widest text-xl w-max">
          <span className="px-8">• TERBAIK DI CILACAP & PURWOKERTO • DEEP CLEAN LAUNDRY • CUCI SEPATU EKSKLUSIF</span>
          <span className="px-8">• TERBAIK DI CILACAP & PURWOKERTO • DEEP CLEAN LAUNDRY • CUCI SEPATU EKSKLUSIF</span>
          <span className="px-8">• TERBAIK DI CILACAP & PURWOKERTO • DEEP CLEAN LAUNDRY • CUCI SEPATU EKSKLUSIF</span>
          <span className="px-8">• TERBAIK DI CILACAP & PURWOKERTO • DEEP CLEAN LAUNDRY • CUCI SEPATU EKSKLUSIF</span>
        </div>
      </div>

      {/* Showcase Video Cards — Dynamic from CMS */}
      <section className="max-w-5xl mx-auto mt-12 mb-20 px-4 flex flex-col md:flex-row justify-center gap-6 relative z-20">
        {showcaseItems.map((item, idx) => (
          <div
            key={item.id}
            className={`w-full md:w-1/3 h-80 rounded-3xl shadow-lg relative overflow-hidden group transition-transform hover:-translate-y-2 ${idx === 1 ? 'md:translate-y-6' : ''}`}
          >
            {item.media_type === 'video' ? (
              <video
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                src={getMediaUrl(item.media_url)}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-700"
                style={{ backgroundImage: `url('${getMediaUrl(item.media_url)}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-white font-bold text-sm tracking-wider uppercase drop-shadow-md">
                <i className={`fa-solid ${item.icon} mr-2 text-primary`}></i>{item.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Advantages */}
      <section id="about" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bebas text-center text-slate-800 mb-2">KEUNGGULAN Ninetynine <span className="text-primary">Shoe</span></h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-bed"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Tiduran Sambil Cuci Sepatu</h3>
            <p className="text-slate-500">Pencetus cuci sepatu sambil tiduran pertama di Indonesia! Anda rebahan, sepatu kesayangan bersih maksimal.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Express Service</h3>
            <p className="text-slate-500">Pengerjaan kilat dan hasil profesional untuk Anda yang butuh cepat menjaga penampilan terbaik.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors group-hover:scale-110 group-hover:rotate-6">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">Pick Up & Delivery</h3>
            <p className="text-slate-500">Antar jemput ke lokasi Anda di wilayah Cilacap dan Purwokerto. Tak perlu repot keluar rumah.</p>
          </div>
        </div>
      </section>

      {/* Loved Banner */}
      <section className="w-full py-40 px-4 text-center relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/uploads/Favorite.jpg')" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bebas text-[10vw] text-white/5 whitespace-nowrap pointer-events-none uppercase tracking-tighter">FAVORITE KICKS</div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bebas text-white mb-8 leading-tight">
            LOVED BY YOUR<br />
            <span className="text-primary italic drop-shadow-[0_2px_10px_rgba(37,99,235,0.5)]">FAVORITE KICKS.</span>
          </h2>
          <a href="https://wa.me/6287720603708" className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bebas tracking-widest text-xl hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:-translate-y-1">
            Hubungi Ninetynine Shoe
          </a>
        </div>
      </section>

      {/* Pricelist */}
      <section id="shoes" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-primary pb-4 mb-12">
          <h2 className="text-5xl md:text-6xl font-bebas text-slate-800 leading-none">SHOES<br /><span className="text-primary">TREATMENT</span></h2>
          <p className="text-slate-400 font-semibold italic text-lg mt-4 md:mt-0">Bersih Menyeluruh & Higienis</p>
        </div>

        <div className="flex flex-col gap-12">
          {loading ? (
            <div className="py-10 text-center text-slate-400 w-full font-medium">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Memuat katalog layanan...
            </div>
          ) : Object.keys(services).length === 0 ? (
            <div className="py-10 text-center text-slate-400 w-full font-medium">
              Belum ada layanan yang tersedia.
            </div>
          ) : (
            Object.entries(services).map(([catName, svcs]: [string, any]) => (
              <div key={catName} className="w-full">
                <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">{catName}</div>
                <div className="grid grid-cols-1 gap-4">
                  {svcs.map((svc: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md hover:border-l-4 hover:border-l-primary transition-all gap-4">
                      <div>
                        <strong className="block text-lg text-slate-800">{svc.name}</strong>
                        <span className="text-sm text-slate-500">{svc.description || ''}</span>
                      </div>
                      <div className="bg-blue-50 text-primary font-bebas text-2xl px-4 py-1 rounded-xl self-start sm:self-auto whitespace-nowrap">
                        {(svc.price / 1000)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>


      {/* DICOMMENT: Another Treatment
      <section id="another" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bebas text-center text-slate-800 mb-2">LAYANAN LAINNYA</h2>
        <p className="text-center text-slate-500 font-medium mb-12">Bukan Sekadar Sepatu</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-motorcycle text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">CUCI HELM</h3>
            <p className="font-bebas text-3xl text-primary mb-2">35K</p>
            <span className="text-xs text-slate-500">Higienis & Bebas Bakteri</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-suitcase-rolling text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TAS CARRIER / KOPER</h3>
            <p className="font-bebas text-3xl text-primary mb-2">55K</p>
            <span className="text-xs text-slate-500">Berbagai Ukuran</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-baby-carriage text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">STROLLER / CARSEAT</h3>
            <p className="font-bebas text-3xl text-primary mb-2">55K</p>
            <span className="text-xs text-slate-500">Pembersihan Ramah Bayi</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-briefcase text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TAS BIASA / KULIT</h3>
            <p className="font-bebas text-3xl text-primary mb-2">35K-40K</p>
            <span className="text-xs text-slate-500">Perawatan Menyeluruh</span>
          </div>
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-md transition-all">
            <i className="fa-solid fa-wallet text-4xl text-primary/80 mb-6"></i>
            <h3 className="font-bold text-slate-800 mb-2">TOPI / DOMPET</h3>
            <p className="font-bebas text-3xl text-primary mb-2">25K</p>
            <span className="text-xs text-slate-500">Kembali Bersih Terawat</span>
          </div>
        </div>
      </section>
      */}

      {/* Testimonials — Dynamic from CMS */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900 text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/uploads/Favorite.jpg')" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bebas tracking-wide mb-4">KATA <span className="text-primary">MEREKA</span></h2>
            <p className="text-slate-400 font-medium">Ribuan pasang sepatu telah kami selamatkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => {
              const stars = Number(t.rating) || 5;
              return (
                <div key={t.id} className="p-8 rounded-3xl border border-slate-700 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(30, 30, 30, 0.7), rgba(30, 30, 30, 0.7))" }}>
                  <i className="fa-solid fa-quote-left text-4xl text-primary/20 absolute top-6 right-6"></i>
                  <div className="flex text-yellow-400 mb-4 text-sm gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fa-solid ${i < stars ? 'fa-star' : 'fa-star text-slate-600'}`}></i>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">{t.text}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xl">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visit Lab */}
      <section id="contact" className="py-20 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl md:text-6xl font-bebas text-slate-800 mb-10">KUNJUNGI<br /><span className="text-primary">LAB KAMI.</span></h2>

          <div className="flex flex-col gap-8">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Area Layanan</strong>
                <p className="text-slate-500">melayani pick up delivery area purwokerto</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Waktu Operasional</strong>
                <p className="text-slate-500">senin-jumat 14.00-17.00, sabtu-minggu 11.00-17.00</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Layanan WhatsApp</strong>
                <a href="https://wa.me/6287720603708" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">0877-2060-3708</a>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <div>
                <strong className="block text-lg text-slate-800 mb-1">Instagram Resmi</strong>
                <a href="https://www.instagram.com/ninetynine.shoe" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">@ninetynine.shoe</a>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-xl relative bg-slate-100">
          <iframe
            src="https://maps.google.com/maps?q=-7.400142,109.253841&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden mt-12">
        <div className="absolute -bottom-10 -right-10 font-bebas text-[15vw] text-white/5 leading-none pointer-events-none">Ninetynine</div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="font-bebas text-4xl mb-4 tracking-wider">Ninetynine Shoe.</h2>
            <p className="text-slate-400 max-w-md mx-auto md:mx-0">Tukang cuci sepatu andalan Anda. Pencetus cuci sepatu sambil tiduran di Indonesia! Berbasis di Cilacap dan Purwokerto.</p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex gap-4 justify-center md:justify-end mb-6">
              <a href="https://www.instagram.com/ninetynine.shoe" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-brands fa-instagram"></i></a>
              <Link href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-brands fa-tiktok"></i></Link>
              <Link href="/admin" title="Admin Panel" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-primary hover:-translate-y-1 transition-all"><i className="fa-solid fa-lock"></i></Link>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Ninetynine Shoe.<br />HAK CIPTA DILINDUNGI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
