import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Play } from 'lucide-react';
import './Utilities.css';

const Utilities = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    buildingId: '',
    electricStart: '',
    electricEnd: '',
    waterStart: '',
    waterEnd: '',
    billingMonth: new Date().toISOString().substring(0, 7) + '-01'
  });
  const [batchMonth, setBatchMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_BASE = 'http://localhost:8080/api/utilities';
      const [resReadings, resInvoices] = await Promise.all([
        axios.get(`${API_BASE}/meter-readings`),
        axios.get(`${API_BASE}/invoices`)
      ]);
      setReadings(resReadings.data);
      setInvoices(resInvoices.data);
    } catch (error) {
      console.error('Error fetching utility data', error);
    }
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/utilities/meter-readings', {
        room: { roomId: parseInt(formData.roomId) },
        building: { buildingId: parseInt(formData.buildingId) },
        electricStart: parseFloat(formData.electricStart),
        electricEnd: parseFloat(formData.electricEnd),
        waterStart: parseFloat(formData.waterStart),
        waterEnd: parseFloat(formData.waterEnd),
        billingMonth: formData.billingMonth
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving reading', error);
      alert('Failed to save reading');
    }
  };

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    try {
      await axios.post(`http://localhost:8080/api/utilities/invoices/batch?billingMonth=${batchMonth}&staffId=1`);
      alert('Batch invoices generated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error generating invoices', error);
      alert('Failed to generate invoices');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="utilities-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Utilities & Billing</h1>
          <p>Manage meter readings and generate monthly invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-6">
        <div className="glass-card">
          <div className="card-header-flex">
            <h3>Meter Readings</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Reading
            </button>
          </div>
          <div className="table-container mt-4" style={{maxHeight: '300px'}}>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Month</th>
                  <th>Elec Use</th>
                  <th>Water Use</th>
                </tr>
              </thead>
              <tbody>
                {readings.length > 0 ? readings.map(r => {
                  const elecUse = r.electricEnd - r.electricStart;
                  const waterUse = r.waterEnd - r.waterStart;
                  return (
                    <tr key={r.readingId}>
                      <td>{r.room?.roomId}</td>
                      <td>{r.billingMonth}</td>
                      <td>{elecUse} kWh</td>
                      <td>{waterUse} m³</td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={4} style={{textAlign: 'center'}}>No readings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header-flex">
            <h3>Batch Invoicing</h3>
          </div>
          <div className="batch-actions mt-4">
            <div className="form-group">
              <label className="form-label">Billing Month (YYYY-MM)</label>
              <input type="month" className="form-control" value={batchMonth} onChange={e => setBatchMonth(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleBatchGenerate} disabled={isGenerating}>
              <Play size={16} />
              {isGenerating ? 'Generating...' : 'Generate Invoices'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card mt-6">
        <h3>Recent Invoices</h3>
        <div className="table-container mt-4">
          <table>
            <thead>
              <tr>
                <th>Inv ID</th>
                <th>Room</th>
                <th>Month</th>
                <th>Total Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? invoices.map(inv => {
                const total = inv.roomFee + inv.electricityFee + inv.waterFee + inv.internetFee;
                return (
                  <tr key={inv.invoiceId}>
                    <td>#{inv.invoiceId}</td>
                    <td>{inv.room?.roomId}</td>
                    <td>{inv.billingMonth}</td>
                    <td>{total.toLocaleString()} VND</td>
                    <td>
                      <span className={`badge badge-${inv.paymentStatus.toLowerCase() === 'paid' ? 'success' : 'danger'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} style={{textAlign: 'center'}}>No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h2>Add Meter Reading</h2>
            <form onSubmit={handleSaveReading}>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Room ID</label>
                  <input type="number" className="form-control" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Building ID</label>
                  <input type="number" className="form-control" value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Electric Start</label>
                  <input type="number" step="0.01" className="form-control" value={formData.electricStart} onChange={e => setFormData({...formData, electricStart: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Electric End</label>
                  <input type="number" step="0.01" className="form-control" value={formData.electricEnd} onChange={e => setFormData({...formData, electricEnd: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Water Start</label>
                  <input type="number" step="0.01" className="form-control" value={formData.waterStart} onChange={e => setFormData({...formData, waterStart: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Water End</label>
                  <input type="number" step="0.01" className="form-control" value={formData.waterEnd} onChange={e => setFormData({...formData, waterEnd: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group mt-4">
                <label className="form-label">Billing Month Date (YYYY-MM-DD)</label>
                <input type="date" className="form-control" value={formData.billingMonth} onChange={e => setFormData({...formData, billingMonth: e.target.value})} required />
              </div>

              <div className="modal-actions mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Check size={16} /> Save Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilities;
