const branchDefault = "https://via.placeholder.com/400x200?text=Branch";

const BRANCHES = [
    { id: 1, name: '수지초 아지트', addr: '용인시 수지구 …', img: branchDefault },
    { id: 2, name: '분당 아지트', addr: '성남시 분당구 …', img: branchDefault },
    { id: 3, name: '죽전 아지트', addr: '용인시 기흥구 …', img: branchDefault },
];

export default function BranchCards() {
    return (
        <section className="section">
            <div className="container">
                <h2 className="title">전국 지점 안내</h2>
                <p className="sub">가까운 지점에서 편리하게 이용하세요</p>

                <div className="branches">
                    {BRANCHES.map(b => (
                        <div key={b.id} className="branch">
                            <img src={b.img} alt={b.name} />
                            <div style={{ fontWeight: 700 }}>{b.name}</div>
                            <div style={{ color: 'var(--muted)' }}>{b.addr}</div>
                            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                                <a className="btn" href="/branch">자세히 보기</a>
                                <a className="btn btn-primary" href="https://pf.kakao.com" target="_blank" rel="noreferrer">문의하기</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
