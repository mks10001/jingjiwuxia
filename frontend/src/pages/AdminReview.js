import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

export default function AdminReview(){
  const [list, setList] = useState([]);
  useEffect(()=>{ fetchQueue(); }, []);
  async function fetchQueue(){
    const data = await apiGet('/admin/review');
    setList(data);
  }
  async function act(id, action){
    await apiPost('/admin/review/' + id, { action });
    fetchQueue();
  }
  return (
    <div>
      <h3>审核队列</h3>
      {list.length===0 && <div>暂无待审作品</div>}
      <ul>
        {list.map(item => (
          <li key={item.id} style={{ marginBottom: 10 }}>
            <div><b>{item.title}</b> — {item.type}</div>
            <div>{item.description}</div>
            <div>
              <button onClick={()=>act(item.id,'approve')}>通过</button>
              <button onClick={()=>act(item.id,'reject')} style={{ marginLeft:8 }}>拒绝</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
