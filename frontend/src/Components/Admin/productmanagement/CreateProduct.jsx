// HarmoniaHub/frontend/src/Components/admin/productmanagement/CreateProduct.jsx
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
  const [imagesFiles, setImagesFiles] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // base64 for preview
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Total size and per-file checks
    const totalSize = files.reduce((t, f) => t + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Total images size should be less than 10MB' });
      return;
    }

    const validFiles = [];
    const previews = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setMsg({ type: 'error', text: 'Please select only image files' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMsg({ type: 'error', text: `Image ${file.name} should be less than 2MB` });
        return;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImagesFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImagesFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.name || !form.price || !form.description || !form.stock) {
      setMsg({ type: 'error', text: 'Please complete required fields.' });
      return;
    }

    if (imagesFiles.length === 0) {
      setMsg({ type: 'error', text: 'Please select at least one product image.' });
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', parseFloat(form.price));
    formData.append('description', form.description);
    formData.append('category', form.category);
    if (form.supplier) formData.append('supplier', form.supplier);
    formData.append('stock', parseInt(form.stock, 10));

    imagesFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/admin/products`, formData, {
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
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select><br /><br />

        <label>Stock*:</label><br />
        <input type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} style={{width:'100%', padding:8}} /><br /><br />

        {/* Multiple file input */}
        <label>Product Images* (Max 5 images, 2MB each):</label><br />
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleFileChange}
          style={{width:'100%', padding:8}} 
        /><br /><br />

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div style={{marginBottom:12}}>
            <strong>Image Previews:</strong>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{position:'relative'}}>
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    style={{
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover', 
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
