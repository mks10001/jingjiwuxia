import React from 'react';
import Create from './pages/Create';
import Market from './pages/Market';
import AdminReview from './pages/AdminReview';
import CreatorPanel from './pages/CreatorPanel';

export default function App(){
  return (
    <div style={{ padding: 20 }}>
      <h1>镜记武侠 Demo 平台</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>创作</h2>
          <Create />
        </div>
        <div style={{ flex: 1 }}>
          <h2>市场</h2>
          <Market />
        </div>
        <div style={{ flex: 1 }}>
          <h2>管理 / 审核</h2>
          <AdminReview />
          <h2>创作者面板</h2>
          <CreatorPanel />
        </div>
      </div>
    </div>
  );
}
