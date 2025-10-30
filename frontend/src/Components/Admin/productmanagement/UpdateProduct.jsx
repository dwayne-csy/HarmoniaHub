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
  const [existingImages, setExistingImages] = useState([]); // objects {public_id, url}
  const [newFiles, setNewFiles] = useState([]); // File objects
  const [newPreviews, setNewPreviews] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchSuppliers();
    }
    // eslint-disable-next-line
  }, [id]);

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
      setExistingImages(product.images || []);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load product.' });
    }
  }

  async function fetchSuppliers() {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.warn('Failed to fetch suppliers', err);
    }
  }

  // Remove an existing image (mark for deletion)
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle new files
  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setMsg(null);

    const previews = [];
    const validFiles = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setMsg({ type: 'error', text: 'Please select image files only' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ type: 'error', text: 'Each image must be less than 5MB' });
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setNewPreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setNewFiles(prev => [...prev, ...validFiles]);
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    if (!form.name) {
      setMsg({ type: 'error', text: 'Name required' });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', parseFloat(form.price || 0));
      formData.append('description', form.description);
      formData.append('category', form.category);
      if (form.supplier) formData.append('supplier', form.supplier);
      formData.append('stock', parseInt(form.stock || 0, 10));

      // Pass existing images metadata as JSON string, so backend can keep them
      formData.append('existingImages', JSON.stringify(existingImages));

      // Append new files
      newFiles.forEach(file => {
        formData.append('images', file);
      });

      await axios.put(`${BASE_URL}/admin/products/${id}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setMsg({ type:'success', text:'Product updated successfully.' });
      setLoading(false);
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err) {
      setLoading(false);
      setMsg({ type:'error', text: err?.response?.data?.message || err.message });
    }
  };

  if (!form.name && !loading) return <div style={{maxWidth:700, margin:'24px auto'}}>Loading...</div>;

  return (
    <div style={{maxWidth:800, margin:'24px auto', padding:16, border:'1px solid #ddd', borderRadius:6}}>
      <h2>Update Product</h2>
      {msg && <div style={{ marginBottom: 12, color: msg.type === 'error' ? '#a00' : '#0a0' }}>{msg.text}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* ... name/price/desc/category/supplier/stock fields same as before */}
        <label><strong>Name:</strong></label><br />
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{width:'100%', padding:8, marginBottom:12}} required />

        <label><strong>Price:</strong></label><br />
        <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} style={{width:'100%', padding:8, marginBottom:12}} />

        <label><strong>Description:</strong></label><br />
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={4} style={{width:'100%', padding:8, marginBottom:12}} />

        <label><strong>Category:</strong></label><br />
        <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} style={{width:'100%', padding:8, marginBottom:12}}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label><strong>Supplier:</strong></label><br />
        <select value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})} style={{width:'100%', padding:8, marginBottom:12}}>
          <option value=''>-- None --</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <label><strong>Stock:</strong></label><br />
        <input type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} style={{width:'100%', padding:8, marginBottom:12}} />

        {/* Existing images */}
        <label><strong>Existing Images:</strong></label>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0 16px 0'}}>
          {existingImages.length === 0 && <div style={{color:'#666'}}>No existing images</div>}
          {existingImages.map((img, idx) => (
            <div key={idx} style={{position:'relative'}}>
              <img src={img.url} alt={`img-${idx}`} style={{width:100, height:100, objectFit:'cover', borderRadius:4}} />
              <button type="button" onClick={() => removeExistingImage(idx)} style={{position:'absolute', top:-8, right:-8, background:'#ff4444', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24}}>×</button>
            </div>
          ))}
        </div>

        {/* New files */}
        <label><strong>Add New Images:</strong></label>
        <input type="file" multiple accept="image/*" onChange={handleNewFileChange} style={{width:'100%', padding:8, marginBottom:12}} />
        {newPreviews.length > 0 && (
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
            {newPreviews.map((p, i) => (
              <div key={i} style={{position:'relative'}}>
                <img src={p} alt={`new-${i}`} style={{width:100, height:100, objectFit:'cover', borderRadius:4, border:'2px solid #007bff'}} />
                <button type="button" onClick={() => removeNewFile(i)} style={{position:'absolute', top:-8, right:-8, background:'#ff4444', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24}}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button type="submit" disabled={loading} style={{padding:'10px 20px', backgroundColor:loading?'#ccc':'#007bff', color:'#fff', border:'none', borderRadius:4}}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
          <button type="button" onClick={()=>navigate('/admin/products')} style={{padding:'10px 20px', backgroundColor:'#6c757d', color:'#fff', border:'none', borderRadius:4}}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
