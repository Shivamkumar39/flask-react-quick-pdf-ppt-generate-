

import React, { useState } from 'react';
import axios from 'axios';

function InputForm() {
  const [formData, setFormData] = useState({
    name: '',
    doc_type: 'Letter',
    to: '',
    from: '',
    title: '',
    message: '',
    date: '',
    style: 'Classic',
  });

  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, to, from, title, message, date } = formData;
    if (!name || !to || !from || !title || !message || !date) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setLinks(null);

    try {
      const res = await axios.post('http://localhost:5000/generate', formData);
      setLinks(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate file. Please check server status or console for errors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">📄 Generate Document</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { label: 'Your Name', name: 'name' },
          { label: 'To', name: 'to' },
          { label: 'From', name: 'from' },
          { label: 'Title', name: 'title' },
          { label: 'Date', name: 'date', type: 'date' },
        ].map(({ label, name, type = 'text' }) => (
          <div key={name}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm resize-none focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
            <select
              name="doc_type"
              value={formData.doc_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
            >
              <option>Letter</option>
              <option>Memo</option>
              <option>Message</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Style</label>
            <select
              name="style"
              value={formData.style}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
            >
              <option>Classic</option>
              <option>Modern</option>
              <option>Elegant</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Generating...' : 'Generate Document'}
        </button>
      </form>

      {links && (
        <div className="mt-8 text-center space-y-4 m-3 p-4">
          <a
            href={`http://localhost:5000${links.pdf_url}`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            📥 Download PDF
          </a>
          <a
            href={`http://localhost:5000${links.ppt_url}`}
            download
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            ⬇️ Download PPT
          </a>
          <br />

        </div>
      )}
    </div>
  );
}

export default InputForm;
