// HarmoniaHub/frontend/src/Components/admin/productmanagement/ViewProduct.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [id]);

  async function fetch() {
    try {
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      setProduct(res.data.product);
    } catch (err) {
      setMsg({ type:'error', text:'Failed to load product.'});
    }
  }

  if (!product) return <div style={{maxWidth:800, margin:'24px auto'}}>Loading...</div>;

  return (
    <div style={{maxWidth:900, margin:'24px auto', padding:16}}>
      <button onClick={()=>navigate('/admin/products')}>Back to list</button>
      <h2 style={{marginTop:12}}>{product.name}</h2>
      <div><strong>Price:</strong> {product.price}</div>
      <div><strong>Category:</strong> {product.category}</div>
      <div><strong>Stock:</strong> {product.stock}</div>
      <div style={{marginTop:8}}><strong>Description:</strong>
        <p>{product.description}</p>
      </div>

      <div>
        <strong>Supplier:</strong>
        {product.supplier ? (
          <div>
            <div>{product.supplier.name}</div>
            <div>{product.supplier.email}</div>
            <div>{product.supplier.phone}</div>
          </div>
        ) : <span> — </span>}
      </div>

      <div style={{marginTop:12}}>
        <strong>Images:</strong>
        <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
          {(product.images || []).map((img, idx) => (
            <div key={idx} style={{width:120, height:100, border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <img src={img.url} alt="" style={{maxWidth:'100%', maxHeight:'100%'}}/>
            </div>
          ))}
          {(product.images || []).length === 0 && <div>No images</div>}
        </div>
      </div>
    </div>
  );
}
