import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import YoneticiLayout from './components/YoneticiLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AnaSayfa from './pages/AnaSayfa';
import Kayit from './pages/Kayit';
import Giris from './pages/Giris';
import Profil from './pages/Profil';
import Oteller from './pages/Oteller';
import OtelDetay from './pages/OtelDetay';
import Hakkimizda from './pages/Hakkimizda';
import Iletisim from './pages/Iletisim';
import GizlilikPolitikasi from './pages/GizlilikPolitikasi';
import Dashboard from './pages/admin/Dashboard';
import YoneticiDashboard from './pages/yonetici/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRooms from './pages/admin/AdminRooms';
import YoneticiOdalar from './pages/yonetici/Odalar';
import YoneticiRezervasyonlar from './pages/yonetici/Rezervasyonlar';
import YoneticiAyarlar from './pages/yonetici/Ayarlar';

const AdminReservations: React.FC = () => {
  return (
    <div>
      <h2>Admin Reservations</h2>
      {/* Reservation management content goes here */}
    </div>
  );
};

const AdminHotels: React.FC = () => {
  return (
    <div>
      <h2>Admin Hotels</h2>
      {/* Hotel management content goes here */}
    </div>
  );
};

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
        <Route
          path="profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
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
        <Route path="kullanicilar" element={<AdminUsers />} />
        <Route path="oteller" element={<AdminHotels />} />
        <Route path="odalar" element={<AdminRooms />} />
        <Route path="rezervasyonlar" element={<AdminReservations />} />
        {/* Add more admin routes here */}
      </Route>

      {/* Hotel Manager Routes */}
      <Route
        path="/yonetici"
        element={
          <ProtectedRoute requireYonetici>
            <YoneticiLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<YoneticiDashboard />} />
        <Route path="odalar" element={<YoneticiOdalar />} />
        <Route path="rezervasyonlar" element={<YoneticiRezervasyonlar />} />
        <Route path="ayarlar" element={<YoneticiAyarlar />} />
      </Route>
    </Routes>
  );
}
