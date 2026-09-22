'use client';
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

/**
 * ShareCardClient - 博客文章分享卡组件
 * Props:
 *   title, description, pubDate, updatedDate, author, license
 */
export default function ShareCardClient({
    title = 'Post Title',
    description = 'This is a summary of the post.',
    pubDate = '',
    author = 'Author Name',
    license = 'CC BY 4.0'
}) {
    const containerRef = useRef(null);
    const qrCanvasRef = useRef(null);

    // 将可能是 Date 对象或字符串的日期统一格式化为字符串
    function fmtDate(d) {
        if (!d) return '—';
        if (typeof d === 'string') return d;
        if (d instanceof Date) return d.toLocaleDateString(); // 可改为 toISOString().slice(0,10)
        // 兼容其它可解析类型
        try {
            const parsed = new Date(d);
            if (!isNaN(parsed)) return parsed.toLocaleDateString();
        } catch (e) { /* ignore */ }
        return String(d);
    }

    async function handleClick() {
        const container = containerRef.current;
        const qrCanvas = qrCanvasRef.current;
        if (!container || !qrCanvas) return;

        const url = window.location.href;

        // 生成二维码
        const ctx = qrCanvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        await QRCode.toCanvas(qrCanvas, url, {
            width: 80,
            margin: 2,
            color: { dark: '#ffffff', light: '#fde7f3' }
        });

        // 渲染并下载
        const canvas = await html2canvas(container, {
            scale: 4,
            backgroundColor: '#0f172a',
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = 'share-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // 这里把日期转换为字符串变量，避免 JSX 中出现 Date 对象
    const pubDateStr = fmtDate(pubDate);

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', marginTop: 12 }}>
            <button
                onClick={handleClick}
                style={{
                    padding: '10px 20px',
                    borderRadius: 20,
                    border: '3px solid #4b5563',
                    backgroundColor: '#fff',
                    color: '#111827',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                    e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#111827';
                }}
            >
                Share This Post 🔗
            </button>

        {/* 隐藏渲染容器（放到屏幕外） */}
        <div
            ref={containerRef}
            aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: '-9999px',
                    left: '-9999px',
                    width: 560,
                    minHeight: 270,
                    padding: 24,
                    background: 'linear-gradient(135deg, #fff1f5 0%, #fde7f3 100%)', // 整体浅粉渐变
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    boxShadow: '0 10px 30px rgba(16,24,40,0.08)',
                    overflow: 'hidden',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                    display: 'flex',          // 横向布局：左文本区，右二维码区
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    gap: 20,
                }}
        >
            {/* 左侧文字区（占满剩余空间） */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {/* Title 行：左侧竖线 + 标题 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 4, height: 28, backgroundColor: '#ec4899', borderRadius: 2, marginTop: 6 }} />
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: '26px', color: '#0f172a' }}>
                        {title}
                    </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: 15, lineHeight: '20px', color: '#374151', marginBottom: 14 }}>
                    {description}
                </div>

                {/* Meta 信息：缩进一点 */}
                <div style={{ marginLeft: 16, color: '#475569', fontSize: 12, lineHeight: '18px' }}>
                    <div><strong style={{ color: '#0f172a', fontWeight: 600 }}>Author:</strong> <span style={{ marginLeft: 6 }}>{author}</span></div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 600 }}>Published:</strong> <span style={{ marginLeft: 6 }}>{pubDateStr}</span></div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 600 }}>License:</strong> <span style={{ marginLeft: 6 }}>{license}</span></div>
                </div>
            </div>

            {/* 右侧二维码区 */}
            <div style={{ width: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <canvas
                    ref={qrCanvasRef}
                    width={120}
                    height={120}
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        width: 120,
                        height: 120,
                        display: 'block',
                        background: '#ffb6c1',
                        borderRadius: 8
                    }}
                />
            </div>
        </div>
    </div>
  );
}
