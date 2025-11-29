import React, { useState, useEffect } from 'react';

export default function CommentBoard() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // 获取留言列表
  const fetchComments = async () => {
    const res = await fetch('http://localhost:3001/comments');
    const data = await res.json();
    setComments(data);
  };

  // 提交留言
  const submitComment = async () => {
    if (!name || !content) return;
    await fetch('http://localhost:3001/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content }),
    });
    setName('');
    setContent('');
    fetchComments();
  };

  useEffect(() => { fetchComments(); }, []);

  return (
    <div style={{border: '1px solid #ccc', padding: '1rem', maxWidth: '600px'}}>
      <h3>留言板</h3>
      <ul>
        {comments.map(c => (
          <li key={c.id}><strong>{c.name}:</strong> {c.content}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={submitComment}>提交</button>
    </div>
  );
}

