"use client";

import { useState, useEffect } from "react";
import { getSubscribers, deleteSubscriber } from "@/app/admin/actions";

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
}

export default function SubscribersPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const data = await getSubscribers();
    setSubscribers(data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`"${email}" 구독자를 삭제하시겠습니까?`)) return;
    await deleteSubscriber(id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }

  const activeCount = subscribers.filter((s) => s.active).length;

  if (loading) return <p className="admin-loading">로딩 중...</p>;

  return (
    <div className="subscribers-panel">
      <div className="subscribers-header">
        <p className="subscribers-count">
          활성 구독자 <strong>{activeCount}</strong>명 / 전체 {subscribers.length}명
        </p>
      </div>

      {subscribers.length === 0 ? (
        <p className="subscribers-empty">아직 구독자가 없습니다.</p>
      ) : (
        <table className="subscribers-table">
          <thead>
            <tr>
              <th>이메일</th>
              <th>상태</th>
              <th>구독일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} style={{ opacity: s.active ? 1 : 0.5 }}>
                <td>{s.email}</td>
                <td>
                  <span className={`subscriber-badge ${s.active ? "active" : "inactive"}`}>
                    {s.active ? "활성" : "취소됨"}
                  </span>
                </td>
                <td className="subscriber-date">{s.subscribedAt}</td>
                <td>
                  <button
                    className="admin-btn"
                    onClick={() => handleDelete(s.id, s.email)}
                    style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
