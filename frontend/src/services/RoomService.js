import api from '../config/api';

class RoomService {
  async createRoom(roomId) {
    const response = await api.post(`/api/room/create`, roomId, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  }

  async joinRoom(roomId) {
    const response = await api.get(`/api/room/join/${roomId}`);
    return response.data;
  }

  async getMessages(roomId) {
    const response = await api.get(`/api/room/${roomId}/messages`);
    return response.data;
  }
}

export default new RoomService();
