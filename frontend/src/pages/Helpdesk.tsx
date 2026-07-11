import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Image as ImageIcon } from 'lucide-react';
import './Helpdesk.css';

const Helpdesk = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    buildingId: '',
    studentId: '',
    description: '',
    priority: 'LOW'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/helpdesk');
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    const ticketBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
    data.append('ticket', ticketBlob);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await axios.post('http://localhost:8080/api/helpdesk', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      fetchTickets();
      // Reset form
      setFormData({ roomId: '', buildingId: '', studentId: '', description: '', priority: 'LOW' });
      setImageFile(null);
    } catch (error) {
      console.error('Error creating ticket', error);
      alert('Failed to create ticket. See console for details.');
    }
  };

  return (
    <div className="helpdesk-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Helpdesk Tickets</h1>
          <p>Manage and track maintenance requests.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Ticket
        </button>
      </div>

      <div className="glass-card mt-6">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map(ticket => (
                <tr key={ticket.ticketId}>
                  <td>#{ticket.ticketId}</td>
                  <td>{ticket.room?.roomId}</td>
                  <td>{ticket.description}</td>
                  <td>
                    <span className={`badge badge-${ticket.priority.toLowerCase() === 'high' ? 'danger' : 'info'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${ticket.status.toLowerCase() === 'open' ? 'warning' : 'success'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    {ticket.imagePath ? (
                      <a href={ticket.imagePath} target="_blank" rel="noreferrer" className="text-info">
                        <ImageIcon size={18} />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h2>Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
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
                  <label className="form-label">Student ID</label>
                  <input type="number" className="form-control" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Image Upload (Optional)</label>
                <input type="file" className="form-control" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" />
              </div>

              <div className="modal-actions mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
