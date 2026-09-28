{{-- ============================================================
     AWG-UIKIT-RACING — App Shell Laravel/Blade (100% lokal, tanpa CDN)
     Author: AWGNET-RACING & AGENT AI TEAM

     CARA PAKAI (Laravel 10/11/12):
     1. Copy ISI dist/ ke public/assets/  →  struktur:
        public/assets/awg-uikit.min.css · awg-core.min.js · awg-select2.min.js
        public/assets/awg-charts.min.js · assets/fonts/*.woff2 · assets/assets/icons.svg
        (dist/awg-uikit.min.css sudah dipointer ke folder fonts/ — jangan ubah path)
     2. Simpan file ini sebagai resources/views/layouts/awg.blade.php
     3. Halaman:
         @extends('layouts.awg')
         @section('title', 'Dashboard')
         @section('content') … @endsection
     4. Menu dari controller: view('…', ['menu' => ['UTAMA' => [ … ], …]])

     Struktur item menu:
        ['label' => 'Dashboard', 'route' => 'dashboard',
         'icon' => 'ic-gauge', 'active' => true|false, 'count' => 12]
     Ikon = id pada assets/icons.svg: ic-gauge, ic-chart, ic-server, ic-wifi,
        ic-router, ic-receipt, ic-money, ic-users, ic-box, ic-database, ic-clock, dsb.
     ============================================================ --}}
@php
    $menu = $menu ?? [];
    // base path folder assets — default /assets, ubah sekali jika layout lain
    $A = asset('assets');
@endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'App') · {{ config('app.name') }}</title>
    <link rel="stylesheet" href="{{ $A }}/awg-uikit.min.css">
    <link rel="icon" href="{{ $A }}/assets/icons.svg">
    <script>
        /* anti-flash dark mode */
        try { const t = localStorage.getItem('awg-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
    </script>
    @stack('head')
</head>
<body>
<div class="awg-app">

    {{-- SIDEBAR --}}
    <aside class="awg-sidebar">
        <div class="awg-brand-box">
            <div class="logo"><svg class="awg-ic"><use href="{{ $A }}/assets/icons.svg#ic-flag"></use></svg></div>
            <div><b>{{ config('app.name') }}</b><small>{{ config('app.tagline', 'Dashboard') }}</small></div>
        </div>
        <nav>
            @foreach ($menu as $label => $items)
                <div class="awg-nav-label">{{ $label }}</div>
                @foreach ($items as $item)
                    <a class="awg-nav-link {{ !empty($item['active']) ? 'active' : '' }}"
                       href="{{ route($item['route']) }}">
                        <svg class="awg-ic"><use href="{{ $A }}/assets/icons.svg#{{ $item['icon'] ?? 'ic-circle' }}"></use></svg>
                        {{ $item['label'] }}
                        @isset($item['count'])<span class="count">{{ $item['count'] }}</span>@endisset
                    </a>
                @endforeach
            @endforeach
            @yield('menu-extra')
        </nav>
        <div class="awg-side-foot">
            <div class="awg-avatar">{{ strtoupper(substr(auth()->user()->name ?? '?', 0, 2)) }}<i class="status"></i></div>
            <div class="awg-flex-1">
                <b>{{ auth()->user()->name ?? '—' }}</b>
                <small>{{ auth()->user() && method_exists(auth()->user(), 'roleLabel') ? auth()->user()->roleLabel() : '' }}</small>
            </div>
            <button class="awg-nav-link" style="width:auto" data-awg-theme-toggle title="Ganti tema">
                <svg class="awg-ic"><use href="{{ $A }}/assets/icons.svg#ic-moon"></use></svg>
            </button>
        </div>
    </aside>
    <div class="awg-overlay"></div>

    {{-- MAIN --}}
    <div class="awg-main">
        <header class="awg-topbar">
            <button class="awg-menu-btn" data-awg-menu><svg class="awg-ic lg"><use href="{{ $A }}/assets/icons.svg#ic-menu"></use></svg></button>
            <div class="awg-crumbs" style="min-width:0;overflow:hidden">
                @yield('crumbs', '<b>'.trim($__env->yieldContent('title', 'App')).'</b>')
            </div>
            @yield('topbar-actions')
        </header>

        <div class="awg-content">
            @if (session('status'))
                <div class="awg-alert ok"><svg class="awg-ic"><use href="{{ $A }}/assets/icons.svg#ic-check-circle"></use></svg> {{ session('status') }}
                    <button class="x" onclick="this.closest('.awg-alert').remove()">✕</button></div>
            @endif
            @if (session('error') ?? $errors->any())
                <div class="awg-alert bad"><svg class="awg-ic"><use href="{{ $A }}/assets/icons.svg#ic-x-circle"></use></svg>
                    {{ session('error') ?? $errors->first() }}
                    <button class="x" onclick="this.closest('.awg-alert').remove()">✕</button></div>
            @endif
            @yield('content')
        </div>
    </div>
</div>

<script src="{{ $A }}/awg-core.min.js"></script>
<script src="{{ $A }}/awg-select2.min.js"></script>
<script src="{{ $A }}/awg-charts.min.js"></script>
@stack('scripts')
</body>
</html>
