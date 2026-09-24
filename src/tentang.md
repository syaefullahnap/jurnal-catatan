---
layout: layouts/base.njk
title: Tentang
description: Siapa di balik Jurnal & Catatan. Tentang kebiasaan menulis, motif, dan mengapa ruang ini dibuat.
permalink: /tentang/
---

<!-- PAGE HEADER -->
<header class="page-header">
  <div class="container-narrow fade-up">
    <span class="eyebrow">Tentang Ruang Ini</span>
    <h1>Sebuah <em>surat</em>, dari saya untuk Anda.</h1>
    <p class="lead">
      Karena menulis tentang dunia selalu berarti menulis tentang diri,
      dan karena internet terlalu bising untuk jeda, jadilah ini rumah kecil.
    </p>
  </div>
</header>

<!-- ABOUT -->
<section style="padding-top: 80px;">
  <div class="container">
    <div class="about-grid">
      <div class="about-portrait fade-up" style="background-image: url('/assets/uploads/sunset-pantai.jpg'); background-size: cover; background-position: center;">
        <div class="about-portrait-content" style="background: linear-gradient(rgba(42, 34, 26, 0.35), rgba(42, 34, 26, 0.55)), radial-gradient(at 30% 30%, rgba(212, 165, 116, 0.4) 0%, transparent 60%);">
          "Saya hanya orang yang belajar menulis dengan jujur, satu kalimat pada satu waktu."
        </div>
      </div>
      <div class="about-body fade-up">
        <span class="eyebrow">Siapa Saya</span>
        <h2>Saya percaya pada <em>kejujuran</em> kecil.</h2>
        <p style="font-family: var(--serif); font-style: italic; font-size: 20px; line-height: 1.7; color: var(--ink-soft);">
          {{ site.tagline }}
        </p>

        <div class="about-details">
          <div class="about-detail">
            <div class="lbl">Dimulai</div>
            <div class="val">{{ site.author.started }}</div>
          </div>
          <div class="about-detail">
            <div class="lbl">Catatan</div>
            <div class="val">{{ collections.posts.length }}+</div>
          </div>
          <div class="about-detail">
            <div class="lbl">Tempat</div>
            <div class="val">Jakarta</div>
          </div>
          <div class="about-detail">
            <div class="lbl">Sekarang</div>
            <div class="val">Menulis &amp; Bertahan</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- QUOTE -->
<section style="padding: 80px 0;">
  <div class="container-narrow">
    <div class="quote-block fade-up">
      <span class="quote-mark">"</span>
      <blockquote>
        Saya tidak menulis untuk mengajari Anda apa-apa.
        Saya menulis karena ada hal-hal yang, kalau tidak ditulis,
        akan menjadi beban yang menumpuk di dada.
      </blockquote>
      <cite>— Catatan untuk Pembaca</cite>
    </div>
  </div>
</section>

<!-- GET IN TOUCH -->
<section>
  <div class="container-narrow" style="text-align: center;">
    <span class="eyebrow fade-up">Berbicara</span>
    <h2 class="fade-up" style="font-size: clamp(34px, 4vw, 48px); font-weight: 500; letter-spacing: -0.02em; margin: 14px 0 24px;">Ingin <em>berbincang</em>?</h2>
    <p class="fade-up" style="font-size: 18px; color: var(--ink-soft); line-height: 1.7; margin-bottom: 32px;">
      Saya tidak selalu bisa membalas cepat, tapi saya selalu membaca.
      Surat paling berarti yang pernah saya terima datang dari orang yang
      tidak saya kenal — dan itu adalah jenis surat yang ingin terus saya terima.
    </p>
    <a href="mailto:{{ site.social.email }}" class="btn btn-primary btn-arrow fade-up">Kirim Surat</a>
    <p style="margin-top: 32px;">
      <a href="/admin/" class="btn btn-ghost btn-arrow fade-up">⚙️ Edit Konten (CMS)</a>
    </p>
  </div>
</section>
