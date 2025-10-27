// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/CreateSupplier.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function CreateSupplier() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });
  const [msg, setMsg] = useState(null);
  const token = localStorage.getItem('token');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    // Basic validation
    if (!form.name || !form.email || !form.phone) {
      setMsg({ type: 'error', text: 'Name, email and phone are required.' });
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode
      }
    };

    try {
      const res = await axios.post(`${BASE_URL}/admin/suppliers`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMsg({ type: 'success', text: 'Supplier created.' });
      setTimeout(()=> navigate('/admin/suppliers'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  return (
    <div style={{maxWidth:700, margin:'24px auto', padding:16, border:'1px solid #ddd', borderRadius:6}}>
      <h2>Create Supplier</h2>
      {msg && <div style={{color: msg.type === 'error' ? '#a00' : '#0a0'}}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <label>Name*:</label><br />
        <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>Email*:</label><br />
        <input value={form.email} type="email" onChange={e=>setForm({...form, email: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>Phone*:</label><br />
        <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>Street:</label><br />
        <input value={form.street} onChange={e=>setForm({...form, street: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>City:</label><br />
        <input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>State:</label><br />
        <input value={form.state} onChange={e=>setForm({...form, state: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>Country:</label><br />
        <input value={form.country} onChange={e=>setForm({...form, country: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <label>Zip Code:</label><br />
        <input value={form.zipCode} onChange={e=>setForm({...form, zipCode: e.target.value})} style={{width:'100%', padding:8}}/>
        <br /><br />

        <button type="submit">Create Supplier</button>
        <button type="button" onClick={()=>navigate('/admin/suppliers')} style={{marginLeft:8}}>Back</button>
      </form>
    </div>
  );
}
