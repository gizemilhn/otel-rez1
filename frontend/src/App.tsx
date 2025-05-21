import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import YoneticiLayout from './components/YoneticiLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AnaSayfa from './pages/AnaSayfa';
import Kayit from './pages/Kayit';
import Giris from './pages/Giris';
import Oteller from './pages/Oteller';
import OtelDetay from './pages/OtelDetay';
import Hakkimizda from './pages/Hakkimizda';
import Iletisim from './pages/Iletisim';
import GizlilikPolitikasi from './pages/GizlilikPolitikasi';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Rooms from './pages/admin/Rooms';
import Hotels from './pages/admin/Hotels';
import AdminReservations from './pages/admin/AdminReservations';
import YoneticiAyarlar from './pages/yonetici/Ayarlar';
import Otel from './pages/yonetici/Otel';
import Odalar from './pages/yonetici/Odalar';
import Rezervasyonlar from './pages/yonetici/Rezervasyonlar';
import YoneticiDashboard from './pages/yonetici/Dashboard';
import Profil from './pages/Profil';
import Rezervasyonlarim from './pages/Rezervasyonlarim';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<AnaSayfa />} />
        <Route path="kayit" element={<Kayit />} />
        <Route path="giris" element={<Giris />} />
        <Route path="oteller" element={<Oteller />} />
        <Route path="oteller/:id" element={<OtelDetay />} />
        <Route path="hakkimizda" element={<Hakkimizda />} />
        <Route path="iletisim" element={<Iletisim />} />
        <Route path="gizlilik-politikasi" element={<GizlilikPolitikasi />} />
        <Route path="profil" element={<Profil />} />
        <Route path="rezervasyonlarim" element={<Rezervasyonlarim />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="kullanicilar" element={<Users />} />
        <Route path="oteller" element={<Hotels />} />
        <Route path="odalar" element={<Rooms />} />
        <Route path="rezervasyonlar" element={<AdminReservations />} />
      </Route>

      {/* Hotel Manager Routes */}
      <Route
        path="/yonetici"
        element={
          <ProtectedRoute requireManager>
            <YoneticiLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<YoneticiDashboard />} />
        <Route path="otel" element={<Otel />} />
        <Route path="odalar" element={<Odalar />} />
        <Route path="rezervasyonlar" element={<Rezervasyonlar />} />
        <Route path="ayarlar" element={<YoneticiAyarlar />} />
      </Route>
    </Routes>
  );
}
