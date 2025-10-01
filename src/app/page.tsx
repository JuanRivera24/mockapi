// src/app/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';

const API_URL = 'https://68dc72c27cd1948060aa515b.mockapi.io/citas';

interface Cita {
  id: string;
  servicio: string;
  estado: 'confirmada' | 'cancelada';
}

export default function HomePage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [formData, setFormData] = useState({ servicio: '', estado: 'confirmada' as Cita['estado'] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // <-- NUEVO: Estado para la búsqueda

  useEffect(() => {
    const getCitas = async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCitas(data);
    };
    getCitas();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const isEditing = editingId !== null;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const savedCita = await response.json();

    if (isEditing) {
      setCitas(citas.map(c => (c.id === editingId ? savedCita : c)));
    } else {
      setCitas([...citas, savedCita]);
    }

    setEditingId(null);
    setFormData({ servicio: '', estado: 'confirmada' });
    setSearchTerm(''); // Limpia la búsqueda después de guardar
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setCitas(citas.filter(c => c.id !== id));
  };

  const handleEdit = (cita: Cita) => {
    setEditingId(cita.id);
    setFormData({ servicio: cita.servicio, estado: cita.estado });
  };
  
  // <-- NUEVO: Prepara el formulario para crear desde la búsqueda
  const handleCreateFromSearch = () => {
    setEditingId(null); // Asegurarse de que no estamos en modo edición
    setFormData({ servicio: searchTerm, estado: 'confirmada' });
  };

  // <-- NUEVO: Filtra las citas en base a la búsqueda
  const filteredCitas = citas.filter(cita =>
    cita.servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Gestión de Citas</h1>
      
      <form onSubmit={handleSave} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={formData.servicio}
          onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
          required
          style={{ padding: '8px', flexGrow: 1, border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }}/>
      
      {/* SECCIÓN DE BÚSQUEDA Y LISTA */}
      <h2>Citas Agendadas ({filteredCitas.length})</h2>
      <input
        type="text"
        placeholder="🔍 Buscar por nombre de servicio..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }}
      />
      
      {/* MENSAJE CUANDO NO HAY RESULTADOS */}
      {searchTerm && filteredCitas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
          <p>No se encontró ningún servicio llamado "<strong>{searchTerm}</strong>".</p>
          <button onClick={handleCreateFromSearch} style={{ marginTop: '10px' }}>
            + Crear este servicio
          </button>
        </div>
      )}
      
      {/* LISTA DE CITAS FILTRADAS */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {filteredCitas.map((cita) => (
          <div key={cita.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <p><strong>Servicio:</strong> {cita.servicio}</p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleEdit(cita)} style={{ marginRight: '10px' }}>Editar</button>
              <button onClick={() => handleDelete(cita.id)}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}