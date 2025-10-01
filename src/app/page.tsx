// src/app/page.tsx

'use client'; // Directiva necesaria en Next.js App Router para usar hooks

import { useState, useEffect, FormEvent } from 'react';


const API_URL = 'https://68dc72c27cd1948060aa515b.mockapi.io/citas';

interface Cita {
  id: string; 
  createdAt: string;
  usuario_id: number;
  fecha: string;
  servicio: string;
  estado: 'confirmada' | 'cancelada';
}

//estado
type CitaFormData = Pick<Cita, 'servicio' | 'estado'>;


export default function HomePage() {
  // Estados para manejar la lista de citas y los datos del formulario
  const [citas, setCitas] = useState<Cita[]>([]);
  const [formData, setFormData] = useState<CitaFormData>({ servicio: '', estado: 'confirmada' });
  const [editingId, setEditingId] = useState<string | null>(null); // Para saber si estamos editando

  // --- READ (LEER) ---
  const fetchCitas = async () => {
    try {
      const response = await fetch(API_URL);
      const data: Cita[] = await response.json();
      setCitas(data);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
    }
  };
  
  // ejecuta por primera vez
  useEffect(() => {
    fetchCitas();
  }, []);

  // --- CREATE (CREAR) y UPDATE (ACTUALIZAR) ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fecha: new Date().toISOString(), usuario_id: 1 }),
      });

      if (response.ok) {
        fetchCitas(); 
        setFormData({ servicio: '', estado: 'confirmada' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error al guardar la cita:', error);
    }
  };
  
  // --- DELETE (BORRAR) ---
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCitas(citas.filter((cita) => cita.id !== id));
      }
    } catch (error) {
      console.error('Error al borrar la cita:', error);
    }
  };
  
  // Función para entrar en modo edición
  const handleEdit = (cita: Cita) => {
    setEditingId(cita.id);
    setFormData({ servicio: cita.servicio, estado: cita.estado });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Gestión de Citas</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={formData.servicio}
          onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
          required
          style={{ padding: '8px', flexGrow: 1 }}
        />
        <select 
          value={formData.estado} 
          onChange={(e) => setFormData({ ...formData, estado: e.target.value as Cita['estado'] })}
          style={{ padding: '8px' }}
        >
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
          {editingId ? 'Actualizar Cita' : 'Crear Cita'}
        </button>
      </form>
      
      <div style={{ display: 'grid', gap: '10px' }}>
        {citas.map((cita) => (
          <div key={cita.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <p><strong>ID:</strong> {cita.id} | <strong>Servicio:</strong> {cita.servicio}</p>
            <p><strong>Estado:</strong> <span style={{ color: cita.estado === 'confirmada' ? 'green' : 'red' }}>{cita.estado}</span></p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleEdit(cita)} style={{ marginRight: '10px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => handleDelete(cita.id)} style={{ cursor: 'pointer' }}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}