// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/ViewSupplier.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(()=> { load(); }, [id]);

  async function load() {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/${id}`);
      setSupplier(res.data.supplier);
    } catch (err) {
      setMsg({ type:'error', text:'Failed to load supplier.'});
    }
  }

  if (!supplier) return <div style={{maxWidth:700, margin:'24px auto'}}>Loading...</div>;

  return (
    <div style={{maxWidth:900, margin:'24px auto', padding:16}}>
      <button onClick={()=>navigate('/admin/suppliers')}>Back to list</button>
      <h2 style={{marginTop:12}}>{supplier.name}</h2>
      <div><strong>Email:</strong> {supplier.email}</div>
      <div><strong>Phone:</strong> {supplier.phone}</div>
      <div style={{marginTop:8}}>
        <strong>Address:</strong>
        <div>{supplier.address?.street}</div>
        <div>{supplier.address?.city}, {supplier.address?.state}</div>
        <div>{supplier.address?.country} - {supplier.address?.zipCode}</div>
      </div>

      <div style={{marginTop:12}}>
        <strong>Products from this supplier:</strong>
        <div>
          {(supplier.products || []).length === 0 ? <div>None</div> :
            <ul>
              {supplier.products.map(p => <li key={p._id}>{p.name} — {p.category} — ₱{p.price}</li>)}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}
