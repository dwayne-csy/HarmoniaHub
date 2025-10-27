// HarmoniaHub/frontend/src/Components/admin/productmanagement/UpdateProduct.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';
const categories = [
  'Idiophones','Membranophones','Chordophones','Aerophones','Electrophones','Keyboard Instruments'
];

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: categories[0],
    supplier: '',
    stock: 0
  });
  const [suppliers, setSuppliers] = useState([]);
  const [imagesText, setImagesText] = useState('');
  const [msg, setMsg] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchSuppliers();
    }
    // eslint-disable-next-line
  }, [id]);

  // Fetch product details to prefill the form
  async function fetchProduct() {
    try {
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      const product = res.data.product;
      setForm({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || categories[0],
        supplier: product.supplier?._id || '',
        stock: product.stock || 0
      });
      setImagesText((product.images || []).map(img => img.url).join('\n'));
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load product.' });
    }
  }

  // Fetch active suppliers for dropdown
  async function fetchSuppliers() {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.warn('Failed to fetch suppliers', err);
    }
  }

  // Convert textarea URLs into Cloudinary-style image objects
  function parseImages(text) {
    return text.split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(url => {
        const parts = url.split('/');
        return { public_id: parts[parts.length - 1], url };
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!form.name) { 
      setMsg({ type: 'error', text: 'Name required' });
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price || 0),
      stock: parseInt(form.stock || 0, 10),
      images: parseImages(imagesText)
    };

    try {
      await axios.put(`${BASE_URL}/admin/products/${id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMsg({ type:'success', text:'Product updated successfully.' });
      setTimeout(() => navigate('/admin/products'), 700);
    } catch (err) {
      setMsg({ type:'error', text: err?.response?.data?.message || err.message });
    }
  }

  if (!form) return <div style={{maxWidth:700, margin:'24px auto'}}>Loading...</div>;

  return (
    <div style={{maxWidth:800, margin:'24px auto', padding:16, border:'1px solid #ddd', borderRadius:6}}>
      <h2>Update Product</h2>
      {msg && <div style={{color: msg.type === 'error' ? '#a00' : '#0a0'}}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <label>Name:</label><br />
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{width:'100%', padding:8}} />
        <br /><br />

        <label>Price:</label><br />
        <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} style={{width:'100%', padding:8}} />
        <br /><br />

        <label>Description:</label><br />
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={4} style={{width:'100%', padding:8}} />
        <br /><br />

        <label>Category:</label><br />
        <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} style={{width:'100%', padding:8}}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <br /><br />

        <label>Supplier:</label><br />
        <select value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})} style={{width:'100%', padding:8}}>
          <option value=''>-- None --</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <br /><br />

        <label>Stock:</label><br />
        <input type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} style={{width:'100%', padding:8}} />
        <br /><br />

        <label>Image URLs (one per line):</label><br />
        <textarea value={imagesText} onChange={e=>setImagesText(e.target.value)} rows={4} style={{width:'100%', padding:8}} />
        <br /><br />

        <button type="submit">Save</button>
        <button type="button" onClick={()=>navigate('/admin/products')} style={{marginLeft:8}}>Back</button>
      </form>
    </div>
  );
}
