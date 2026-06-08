import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Edit3,
  Facebook,
  Fish,
  Gauge,
  ImagePlus,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  Phone,
  Save,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Upload,
  Waves,
  Wand2,
  Wrench,
  X
} from "lucide-react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import { deleteImage, isSupabaseConfigured, uploadImage as uploadToSupabase } from "./lib/supabaseStorage";
import { createGallery, deleteGallery, getGallery, updateGallery } from "./lib/galleryService";
import "./styles.css";

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || "6287854025938";
const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/putra.ajex.3/photos";
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL || "https://www.tiktok.com/@putradanisa";
const BUSINESS_ADDRESS = import.meta.env.VITE_BUSINESS_ADDRESS || "Alamat Workshop AJEX FISHING";
const HERO_LOGO = "/assets/ajex-logo-title.png";
const WEB_LOGO = "/assets/ajex-logo-web.png";
const HERO_LOGO_FALLBACK = "/assets/ajex-logo-title.svg";
const WEB_LOGO_FALLBACK = "/assets/ajex-logo-web.svg";

const categories = ["Semua", "Restorasi", "Custom Float", "Rebuild Joran", "Wrapping", "Reel", "Dokumentasi"];

const services = [
  ["Restorasi Joran Patah", "Perbaikan blank, sambungan, ring, dan finishing agar joran kembali kuat dipakai.", Wrench],
  ["Rebuild Joran dari Nol", "Perakitan ulang dari blank, handle, ring guide, wrapping, sampai finishing akhir.", Wand2],
  ["Custom Wrapping", "Kombinasi warna benang, motif, dan detail personal dengan hasil presisi.", Waves],
  ["Pembuatan Float Custom", "Float dibuat sesuai kebutuhan teknik, arus, warna marker, dan preferensi pemancing.", CircleDot],
  ["Servis dan Perawatan Reel", "Pembersihan, pengecekan gear, pelumasan, dan perawatan putaran reel.", Gauge],
  ["Modifikasi Perlengkapan Mancing", "Penyesuaian komponen, grip, ring, aksesori, dan setup sesuai gaya memancing.", Fish]
];

const testimonials = [
  ["Joran patah saya kembali enak dipakai. Finishing-nya rapi dan sambungannya terasa solid.", "Rian P."],
  ["Float custom sesuai request warna dan ukuran. Detail kecilnya kelihatan niat.", "Agus M."],
  ["Reel jadi lebih halus setelah servis. Komunikasi jelas dan pengerjaan cepat.", "Dedi S."]
];

function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return isAdminRoute ? <AdminPage /> : <PublicSite />;
}

function PublicSite() {
  const [gallery, setGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [preview, setPreview] = useState(null);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useScrollReveal();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setGallery([]);
      setLoadingGallery(false);
      return;
    }

    let active = true;

    getGallery({ limit: 24 })
      .then((data) => {
        console.log("GALLERY API RESPONSE", data);
        if (!active) return;
        setGallery(data || []);
      })
      .catch(() => {
        if (!active) return;
        setGallery([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingGallery(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    console.log("GALLERY STATE", gallery);
  }, [gallery]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((index) => (index + 1) % testimonials.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

  const filteredGallery = useMemo(() => {
    if (activeCategory === "Semua") return gallery;
    return gallery.filter((item) => item.category === activeCategory);
  }, [activeCategory, gallery]);

  useEffect(() => {
    console.log("FILTERED GALLERY", filteredGallery);
  }, [filteredGallery]);

  const whatsappLink = makeWhatsAppLink(
    "Halo AJEX FISHING, saya ingin konsultasi restorasi atau custom peralatan mancing."
  );

  return (
    <>
      <LoadingScreen />
      <header className="site-header">
        <a className="brand" href="#home" aria-label="AJEX FISHING home">
          <BrandLogo />
        </a>
        <nav className={mobileOpen ? "nav open" : "nav"}>
          <a href="#home" onClick={() => setMobileOpen(false)}>Beranda</a>
          <a href="#about" onClick={() => setMobileOpen(false)}>Tentang</a>
          <a href="#services" onClick={() => setMobileOpen(false)}>Layanan</a>
          <a href="#gallery" onClick={() => setMobileOpen(false)}>Galeri</a>
          <a href="#testimonials" onClick={() => setMobileOpen(false)}>Testimoni</a>
          <a href="#order" onClick={() => setMobileOpen(false)}>Pemesanan</a>
          <a href="/admin">Admin</a>
        </nav>
        <div className="header-actions">
          <a className="icon-btn social-nav" href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook AJEX FISHING">
            <Facebook size={18} />
          </a>
          <a className="icon-btn social-nav" href={TIKTOK_URL} target="_blank" rel="noreferrer" aria-label="TikTok AJEX FISHING">
            <Music2 size={18} />
          </a>
          <a className="icon-btn social-nav cta-icon" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="WhatsApp AJEX FISHING">
            <MessageCircle size={18} />
          </a>
          <button className="icon-btn" onClick={() => setDark((value) => !value)} aria-label="Ganti dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-media" role="img" aria-label="Workshop restorasi dan custom peralatan mancing" />
          <div className="hero-overlay" />
          <div className="container hero-grid">
            <div className="hero-content reveal">
              <h1 className="sr-only">AJEX FISHING</h1>
              <img
                className="hero-title-logo"
                src={HERO_LOGO}
                alt="AJEX FISHING"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = HERO_LOGO_FALLBACK;
                }}
              />
              <p className="eyebrow">Restorasi • Custom • Craftsmanship</p>
              <h2>Spesialis Restorasi Joran, Custom Float, dan Perakitan Peralatan Mancing Berkualitas.</h2>
              <p>
                Dari joran patah hingga pembuatan custom dari nol, kami menghadirkan pengerjaan
                detail, rapi, dan tahan lama untuk menemani setiap perjalanan memancing Anda.
              </p>
              <div className="hero-buttons">
                <a className="btn primary" href="#gallery">
                  Lihat Hasil Pekerjaan <ArrowRight size={18} />
                </a>
                <a className="btn ghost" href={whatsappLink} target="_blank" rel="noreferrer">
                  <Phone size={18} /> Hubungi WhatsApp
                </a>
              </div>
            </div>
            <div className="hero-showcase reveal">
              <div className="rod-line" />
              <div className="float-orb" />
              <strong>Workshop Detail</strong>
              <span>Restorasi joran patah, custom wrapping, float handmade, dan servis reel.</span>
              <div className="showcase-tags">
                <small>Blank Repair</small>
                <small>Float Custom</small>
                <small>Rebuild</small>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="container split">
            <div className="reveal">
              <p className="eyebrow">Tentang Kami</p>
              <h2>Workshop custom dengan perhatian besar pada detail.</h2>
            </div>
            <div className="about-copy reveal">
              <p>
                AJEX FISHING adalah workshop yang berfokus pada restorasi, perbaikan,
                dan pembuatan perlengkapan memancing secara custom.
              </p>
              <p>
                Setiap pengerjaan dilakukan dengan ketelitian tinggi mulai dari perbaikan
                blank joran, custom wrapping, pembuatan float, hingga rebuild total sesuai
                kebutuhan pelanggan.
              </p>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Layanan</p>
              <h2>Restorasi, rebuild, dan custom gear untuk pemancing yang peduli kualitas.</h2>
            </div>
            <div className="service-grid">
              {services.map(([title, description, Icon]) => (
                <article className="service-card reveal" key={title}>
                  <div className="service-icon"><Icon size={24} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <StatsSection />

        <section id="gallery" className="section gallery-section">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Hasil Pekerjaan</p>
              <h2>Dokumentasi restorasi, custom build, dan berbagai proyek yang telah kami selesaikan.</h2>
            </div>
            <div className="category-tabs reveal">
              {categories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            {loadingGallery ? (
              <div className="center-state"><Loader2 className="spin" /> Memuat galeri...</div>
            ) : filteredGallery.length ? (
              <div className="masonry">
                {filteredGallery.map((item) => (
                  <button className="gallery-item" key={item.id} onClick={() => setPreview(item)}>
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.category}</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="center-state">Galeri belum tersedia. Silakan upload gambar asli terlebih dahulu.</div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container video-card reveal">
            <div>
              <p className="eyebrow">Konsultasi Workshop</p>
              <h2>Punya joran patah atau ingin custom dari nol?</h2>
              <p>Kirim foto kondisi barang lewat WhatsApp agar kami bisa memberi arahan pengerjaan yang paling tepat.</p>
            </div>
            <a className="btn primary" href={makeWhatsAppLink("Halo AJEX FISHING, saya ingin konsultasi kondisi joran atau custom perlengkapan mancing.")} target="_blank" rel="noreferrer">
              <Phone size={18} /> Hubungi WhatsApp
            </a>
          </div>
        </section>

        <OrderSection />
        <TestimonialSection index={testimonialIndex} setIndex={setTestimonialIndex} />
      </main>

      <Footer />
      <FloatingSocial />
      {preview && <ImagePreview item={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

function StatsSection() {
  const stats = [
    ["120+", "Joran Direstorasi"],
    ["80+", "Float Custom"],
    ["6", "Tahun Pengalaman"],
    ["98%", "Pelanggan Puas"]
  ];

  return (
    <section className="stats-band">
      <div className="container stats-grid">
        {stats.map(([value, label]) => (
          <CounterStat key={label} value={value} label={label} />
        ))}
      </div>
    </section>
  );
}

function CounterStat({ value, label }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const target = Number.parseInt(value, 10);
  const suffix = value.replace(String(target), "");

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / 1400, 1);
        setCount(Math.floor(target * progress));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.4 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="stat reveal" ref={ref}>
      <strong>{count}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

function OrderSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "Restorasi Joran Patah",
    description: ""
  });

  const submit = (event) => {
    event.preventDefault();
    const text = [
      "Halo AJEX FISHING, saya ingin memesan layanan.",
      `Nama: ${form.name}`,
      `Nomor WhatsApp: ${form.phone}`,
      `Jenis layanan: ${form.service}`,
      `Deskripsi: ${form.description}`
    ].join("\n");
    window.open(makeWhatsAppLink(text), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="order" className="section order-section">
      <div className="container split">
        <div className="reveal">
          <p className="eyebrow">Pemesanan</p>
          <h2>Ceritakan kondisi gear Anda, lalu lanjut konsultasi via WhatsApp.</h2>
          <p className="muted">
            Form ini tidak menyimpan data. Setelah submit, pesan akan langsung dibuka
            ke WhatsApp AJEX FISHING agar proses konsultasi lebih cepat.
          </p>
        </div>
        <form className="order-form reveal" onSubmit={submit}>
          <label>Nama<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Nomor WhatsApp<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>
            Jenis layanan
            <select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              {services.map(([title]) => <option key={title}>{title}</option>)}
            </select>
          </label>
          <label>Deskripsi pekerjaan<textarea required rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <button className="btn primary" type="submit"><Phone size={18} /> Kirim ke WhatsApp</button>
        </form>
      </div>
    </section>
  );
}

function TestimonialSection({ index, setIndex }) {
  const current = testimonials[index];

  return (
    <section id="testimonials" className="section testimonial-section">
      <div className="container">
        <div className="section-heading reveal">
          <p className="eyebrow">Testimoni</p>
          <h2>Apa Kata Pelanggan Kami</h2>
        </div>
        <div className="testimonial reveal">
          <div className="stars">{Array.from({ length: 5 }).map((_, item) => <Star key={item} size={18} fill="currentColor" />)}</div>
          <blockquote>"{current[0]}"</blockquote>
          <strong>{current[1]}</strong>
          <div className="slider-actions">
            <button className="icon-btn" onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)} aria-label="Testimoni sebelumnya"><ChevronLeft size={20} /></button>
            <button className="icon-btn" onClick={() => setIndex((index + 1) % testimonials.length)} aria-label="Testimoni berikutnya"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand" href="#home"><BrandLogo /></a>
          <p>Restorasi dan Custom Peralatan Mancing.</p>
        </div>
        <div>
          <h3>Kontak</h3>
          <a href={makeWhatsAppLink("Halo AJEX FISHING, saya ingin bertanya tentang layanan restorasi atau custom.")}>WhatsApp</a>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">Facebook</a>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok</a>
        </div>
        <div>
          <h3>Alamat Workshop</h3>
          <p>{BUSINESS_ADDRESS}</p>
        </div>
      </div>
      <div className="copyright">Copyright © {new Date().getFullYear()} AJEX FISHING.</div>
    </footer>
  );
}

function BrandLogo() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <img
        src={WEB_LOGO}
        alt="AJEX FISHING"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = WEB_LOGO_FALLBACK;
        }}
      />
      <strong>AJEX FISHING</strong>
    </span>
  );
}

function FloatingSocial() {
  return (
    <div className="floating-social" aria-label="Social media AJEX FISHING">
      <a href={makeWhatsAppLink("Halo AJEX FISHING, saya ingin konsultasi.")} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <MessageCircle size={19} />
      </a>
      <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook">
        <Facebook size={19} />
      </a>
      <a href={TIKTOK_URL} target="_blank" rel="noreferrer" aria-label="TikTok">
        <Music2 size={19} />
      </a>
    </div>
  );
}

function ImagePreview({ item, onClose }) {
  return (
    <div className="preview" role="dialog" aria-modal="true">
      <button className="icon-btn preview-close" onClick={onClose} aria-label="Tutup preview"><X size={22} /></button>
      <img src={item.imageUrl} alt={item.title} />
      <div>
        <strong>{item.title}</strong>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

function AdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  if (!isFirebaseConfigured) return <FirebaseMissing />;
  if (authLoading) return <div className="admin-shell center-state"><Loader2 className="spin" /> Memuat admin...</div>;
  if (!user) return <LoginPage />;

  return <AdminDashboard user={user} />;
}

function FirebaseMissing() {
  return (
    <div className="admin-shell center-state">
      <ShieldCheck size={36} />
      <h1>Firebase belum dikonfigurasi</h1>
      <p>Isi environment variable sesuai `.env.example`, lalu deploy ulang.</p>
      <a className="btn ghost" href="/">Kembali ke Website</a>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Email atau password admin tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell login-shell">
      <form className="login-card" onSubmit={submit}>
        <a className="brand" href="/"><BrandLogo /></a>
        <h1>Login Admin</h1>
        <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />} Masuk
        </button>
      </form>
    </main>
  );
}

function AdminDashboard({ user }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Restorasi", file: null });

  const loadInitial = async () => {
    const data = await getGallery({ limit: 18, offset: 0 });
    setItems(data);
    setOffset(data.length);
    setHasMore(data.length === 18);
    setLoading(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const loadMore = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    const data = await getGallery({ limit: 18, offset });
    setItems((current) => [...current, ...data]);
    setOffset(offset + data.length);
    setHasMore(data.length === 18);
    setLoadingMore(false);
  };

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!form.file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const compressed = await compressImage(form.file);
      const filePath = `gallery/${Date.now()}-${slugify(form.title || form.file.name)}.jpg`;
      const { publicUrl: imageUrl, path: storagePath } = await uploadToSupabase(compressed, filePath, {
        onProgress: setUploadProgress
      });
      setUploadProgress(100);

      const metadata = {
        title: form.title,
        description: form.description,
        category: form.category,
        imageUrl,
        storagePath
      };
      const createdItem = await createGallery(metadata);
      setItems((current) => [createdItem, ...current]);
      setOffset((current) => current + 1);
      setForm({ title: "", description: "", category: "Restorasi", file: null });
      event.target.reset();
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const updateItem = async (item, changes) => {
    const updatedItem = await updateGallery(item.id, changes);
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, ...updatedItem } : entry)));
  };

  const deleteItem = async (item) => {
    const confirmed = window.confirm(`Hapus "${item.title}" dari galeri?`);
    if (!confirmed) return;

    if (item.storagePath || item.imageUrl) {
      await deleteImage(item.storagePath || item.imageUrl).catch(() => {});
    }
    await deleteGallery(item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="brand" href="/"><BrandLogo /></a>
        <div>
          <span>{user.email}</span>
          <button className="btn ghost" onClick={() => signOut(auth)}><LogOut size={18} /> Keluar</button>
        </div>
      </header>

      <section className="admin-grid">
        <form className="admin-panel upload-panel" onSubmit={uploadImage}>
          <h1>Upload Foto</h1>
          <label>Judul<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Deskripsi<textarea required rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label>
            Kategori
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.filter((category) => category !== "Semua").map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="file-box">
            <ImagePlus size={28} />
            <span>{form.file ? form.file.name : "Pilih gambar"}</span>
            <input type="file" accept="image/*" required onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} />
          </label>
          {uploading && <div className="progress"><span style={{ width: `${uploadProgress}%` }} /> <small>{uploadProgress}%</small></div>}
          <button className="btn primary" type="submit" disabled={uploading}>
            {uploading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />} Upload
          </button>
        </form>

        <section className="admin-panel">
          <h1>Data Galeri</h1>
          {loading ? (
            <div className="center-state"><Loader2 className="spin" /> Memuat data...</div>
          ) : (
            <>
              <div className="admin-list">
                {items.map((item) => (
                  <AdminGalleryItem
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                  />
                ))}
              </div>
              {hasMore && <button className="btn ghost load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Memuat..." : "Muat Lagi"}</button>}
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function AdminGalleryItem({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: item.title,
    description: item.description,
    category: item.category
  });

  const save = async () => {
    await onUpdate(item, draft);
    setEditing(false);
  };

  return (
    <article className="admin-item">
      <img src={item.imageUrl} alt={item.title} loading="lazy" />
      <div>
        {editing ? (
          <div className="edit-fields">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea rows="3" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
              {categories.filter((category) => category !== "Semua").map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
        ) : (
          <>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.category}</small>
          </>
        )}
        <div className="item-actions">
          {editing ? (
            <button className="icon-btn" onClick={save} aria-label="Simpan"><Save size={18} /></button>
          ) : (
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit"><Edit3 size={18} /></button>
          )}
          <button className="icon-btn danger" onClick={() => onDelete(item)} aria-label="Hapus"><Trash2 size={18} /></button>
        </div>
      </div>
    </article>
  );
}

function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="loading-screen">
      <Loader2 className="spin" />
      <span>AJEX FISHING</span>
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.16 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

async function compressImage(file) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const maxWidth = 1800;
  const scale = Math.min(1, maxWidth / image.width);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.82);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

function makeWhatsAppLink(message) {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "gallery";
}

createRoot(document.getElementById("root")).render(<App />);
