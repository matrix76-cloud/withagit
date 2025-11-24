import React from 'react';
import { Outlet } from 'react-router-dom';

export default function EmptyLayout() {
    return (
        <main className="page-wrap">
            <Outlet />
        </main>
    );
}
