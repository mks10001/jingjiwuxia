import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

export default function Market(){
  const [list, setList] = useState([]);
  useEffect(()=>{ fetchList(); }, []);
  async function fetchList(){
    const data = await apiGet('/listings');
    setList(data);
  }
  async function buy(id){
    await apiPost('/listings/' + id + '/buy', { buyer_id: 2 });
    alert('模拟购买成功');
    fetchList();
  }
  return (
    <div>
      {list.length===0 && <div>没有上架作品</div>}
      <ul>
        {list.map(l => (
          <li key={l.id} style={{ marginBottom: 12 }}>
            <div><b>{l.title}</b> — ¥{l.price} ({l.currency})</div>
            <div>{l.description}</div>
            {l.image_path && <img src={(process.env.REACT_APP_API_BASE || 'http://localhost:4000').replace('/api','') + l.image_path} alt="img" style={{ width:120 }} />}
            <div><button onClick={()=>buy(l.id)}>模拟购买</button></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
