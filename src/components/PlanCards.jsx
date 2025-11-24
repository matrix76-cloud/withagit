import { useNavigate } from 'react-router-dom';

const PLANS = [
    {
        key: 'light',
        label: '라이트',
        name: '시간권',
        points: ['시간 단위 이용', '유연한 예약', '기본 돌봄 서비스'],
    },
    {
        key: 'sub',
        label: '추천',
        name: '월정액',
        recommend: true,
        points: ['월 무제한 정액', '우선 예약', '프리미엄 돌봄', '24시간 고객지원'],
    },
    {
        key: 'wallet',
        label: '정액권',
        name: '충전권',
        points: ['선불 충전', '할인 혜택', '사용 내역 관리'],
    },
];

export default function PlanCards() {
    const nav = useNavigate();
    return (
        <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
                <h2 className="title">다양한 멤버십 플랜</h2>
                <p className="sub">가족의 라이프스타일에 맞는 멤버십을 선택하세요</p>

                <div className="plans">
                    {PLANS.map(p => (
                        <div key={p.key} className={`plan ${p.recommend ? 'recommend' : ''}`}>
                            {p.label && <div style={{ color: '#fff', background: 'var(--primary)', display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: 12, marginBottom: 10 }}>{p.label}</div>}
                            <div className="name">{p.name}</div>
                            <ul>
                                {p.points.map((t, i) => <li key={i}>• {t}</li>)}
                            </ul>
                            <div style={{ marginTop: 16 }}>
                                <button className="btn btn-primary" onClick={() => nav('/membership')}>자세히 보기</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
