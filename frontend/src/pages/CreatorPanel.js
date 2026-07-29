import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

export default function CreatorPanel(){
  const [balance, setBalance] = useState(0);
  useEffect(()=>{ fetchBalance(); }, []);
  async function fetchBalance(){
    const r = await apiGet('/creators/1/balance');
    setBalance(r.balance || 0);
  }
  async function requestPayout(){
    await apiPost('/payouts/request', { creator_id: 1, amount: balance });
    alert('已申请提现（模拟）');
  }
  return (
    <div>
      <div>创作者余额（模拟）：¥{balance}</div>
      <button onClick={requestPayout}>申请提现（模拟）</button>
    </div>
  );
}
