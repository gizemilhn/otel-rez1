import React, { useEffect, useState } from 'react';
import userService from '../../services/api';
import { toast } from 'react-toastify';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.get('/users');
      setUsers(response.data);
    } catch {
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('Kullanıcı silindi');
    } catch {
      toast.error('Kullanıcı silinemedi');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Kullanıcılar</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Ad Soyad</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Kayıt Tarihi</th>
              <th className="px-4 py-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-2">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {/* Edit functionality can be added here */}
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
