import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';

const categories = [
  'Idiophones','Membranophones','Chordophones','Aerophones','Electrophones','Keyboard Instruments'
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: categories[0],
    supplier: '',
    stock: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [image, setImage] = useState("");       // base64 string
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
        if (res.data?.suppliers) setSuppliers(res.data.suppliers);
      } catch (err) {
        console.error('fetch suppliers error', err);
      }
    };
    fetchSuppliers();
  }, []);

  // Handle file selection and convert to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setMsg({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);       // base64
      setImagePreview(reader.result); // preview
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.name || !form.price || !form.description || !form.stock) {
      setMsg({ type: 'error', text: 'Please complete required fields.' });
      return;
    }

    if (!image) {
      setMsg({ type: 'error', text: 'Please select a product image.' });
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      images: [{ url: image, public_id: 'local_product_' + Date.now() }]
    };

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/admin/products`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMsg({ type: 'success', text: 'Product created successfully.' });
      setLoading(false);
      setTimeout(() => navigate('/admin/products'), 900);
    } catch (error) {
      setLoading(false);
      const text = error?.response?.data?.message || error.message;
      setMsg({ type: 'error', text });
    }
  };

  return (
    <div style={{maxWidth:800, margin:'24px auto', padding:16, border:'1px solid #ddd', borderRadius:6}}>
      <h2>Create Product</h2>
      {msg && <div style={{marginBottom:12, color: msg.type === 'error' ? '#a00' : '#0a0'}}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        <label>Name*:</label><br />
        <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} style={{width:'100%', padding:8}} /><br /><br />

        <label>Price*:</label><br />
        <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} style={{width:'100%', padding:8}} /><br /><br />

        <label>Description*:</label><br />
        <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} style={{width:'100%', padding:8}} /><br /><br />

        <label>Category*:</label><br />
        <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} style={{width:'100%', padding:8}}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select><br /><br />

        <label>Supplier (optional):</label><br />
        <select value={form.supplier} onChange={e=>setForm({...form, supplier: e.target.value})} style={{width:'100%', padding:8}}>
          <option value=''>-- None --</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
        </select><br /><br />

        <label>Stock*:</label><br />
        <input type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} style={{width:'100%', padding:8}} /><br /><br />

        {/* File input */}
        <label>Product Image*:</label><br />
        <input type="file" accept="image/*" onChange={handleFileChange} style={{width:'100%', padding:8}} /><br /><br />

        {imagePreview && (
          <div style={{textAlign:'center', marginBottom:12}}>
            <img src={imagePreview} alt="Preview" style={{width:'150px', height:'150px', objectFit:'cover', border:'1px solid #ddd'}} />
          </div>
        )}

        <button type="submit" disabled={loading} style={{padding:'8px 16px'}}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
        <button type="button" onClick={()=>navigate('/admin/products')} style={{marginLeft:8}}>Back to list</button>
      </form>
    </div>
  );
}
