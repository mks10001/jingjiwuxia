import React, { useState } from 'react';
import { apiPost } from '../services/api';

export default function Create(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('weapon');
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');

  const submit = async () => {
    let imageBase64 = null;
    if (image) {
      const data = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(image);
      });
      imageBase64 = data;
    }
    const res = await apiPost('/creations', { title, description, type, imageBase64, creator_id: 1 });
    if (res.success) setMsg('创建成功，ID=' + res.id);
    else setMsg('出错: ' + JSON.stringify(res));
  };

  const submitAudit = async () => {
    // naive: get latest creation id by querying creations
    const r = await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:4000/api') + '/creations');
    const list = await r.json();
    const last = list.find(c => c.creator_id === 1 && c.status === 'draft');
    if (!last) { setMsg('没有 draft 作品。'); return; }
    await apiPost('/creations/' + last.id + '/submit', {});
    setMsg('提交审核：id=' + last.id);
  };

  return (
    <div>
      <div>
        <input placeholder="标题" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <textarea placeholder="描述" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="weapon">武器</option>
          <option value="skill">招式</option>
          <option value="school">门派</option>
        </select>
      </div>
      <div>
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={submit}>保存为 Draft</button>
        <button onClick={submitAudit} style={{ marginLeft: 8 }}>提交审核</button>
      </div>
      <div style={{ marginTop: 8 }}>{msg}</div>
    </div>
  );
}
