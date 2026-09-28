{{-- ============================================================
     AWG-UIKIT-RACING — App Shell Laravel/Blade
     Author: AWGNET-RACING & AGENT AI TEAM

     CARA PAKAI (Laravel 10/11/12):
     1. Copy folder dist/ ke public/assets/  (atau via Vite)
     2. Simpan file ini sebagai resources/views/layouts/awg.blade.php
     3. Halaman:
         @extends('layouts.awg')
         @section('title', 'Dashboard')
         @section('content') … @endsection
     4. Menu dari controller:  view('…', ['menu' => ['UTAMA' => [...], …]])

     Struktur item menu:
        ['label' => 'Dashboard', 'route' => 'dashboard',
         'icon' => 'fa-gauge', 'active' => true|false, 'count' => 12]
     ============================================================ --}}
@php $menu = $menu ?? []; @endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'App') · {{ config('app.name') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/awg-uikit.min.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">
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
            <div class="logo">{{ substr(config('app.name'), 0, 1) }}</div>
            <div><b>{{ config('app.name') }}</b><small>{{ config('app.tagline', 'Dashboard') }}</small></div>
        </div>
        <nav>
            @foreach ($menu as $label => $items)
                <div class="awg-nav-label">{{ $label }}</div>
                @foreach ($items as $item)
                    <a class="awg-nav-link {{ !empty($item['active']) ? 'active' : '' }}"
                       href="{{ route($item['route']) }}">
                        <i class="fa-solid {{ $item['icon'] ?? 'fa-circle' }}"></i> {{ $item['label'] }}
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
                <i class="fa-solid fa-moon"></i>
            </button>
        </div>
    </aside>
    <div class="awg-overlay"></div>

    {{-- MAIN --}}
    <div class="awg-main">
        <header class="awg-topbar">
            <button class="awg-menu-btn" data-awg-menu><i class="fa-solid fa-bars"></i></button>
            <div class="awg-crumbs" style="min-width:0;overflow:hidden">
                @yield('crumbs', '<b>'.trim($__env->yieldContent('title')).'</b>')
            </div>
            @yield('topbar-actions')
        </header>

        <div class="awg-content">
            @if (session('status'))
                <div class="awg-alert ok"><i class="fa-solid fa-circle-check"></i> {{ session('status') }}
                    <button class="x" onclick="this.closest('.awg-alert').remove()">✕</button></div>
            @endif
            @if (session('error') ?? $errors->any())
                <div class="awg-alert bad"><i class="fa-solid fa-circle-xmark"></i>
                    {{ session('error') ?? $errors->first() }}
                    <button class="x" onclick="this.closest('.awg-alert').remove()">✕</button></div>
            @endif
            @yield('content')
        </div>
    </div>
</div>

<script src="{{ asset('assets/awg-core.min.js') }}"></script>
<script src="{{ asset('assets/awg-select2.min.js') }}"></script>
@stack('scripts')
</body>
</html>
