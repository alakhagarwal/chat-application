import api from '../config/api';

class RoomService {
  /**
   * Create a new room. 
   * The Spring Boot controller expects a raw String for the body,
   * so we explicitly set the Content-Type to text/plain.
   * 
   * @param {String} roomId - The ID of the room to create
   * @returns {Promise<any>} - Returns the created Room entity from backend
   */
  async createRoom(roomId) {
    const response = await api.post(`/api/room/create`, roomId, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  }

  /**
   * Join an existing room
   * 
   * @param {String} roomId - The ID of the room to join
   * @returns {Promise<any>} - Returns the Room entity from backend
   */
  async joinRoom(roomId) {
    const response = await api.get(`/api/room/join/${roomId}`);
    return response.data;
  }

  /**
   * Retrieve all messages for a specific room
   * 
   * @param {String} roomId - The ID of the room
   * @returns {Promise<Array>} - Returns an array of Message objects
   */
  async getMessages(roomId) {
    const response = await api.get(`/api/room/${roomId}/messages`);
    return response.data;
  }
}

// Export a single instance to be used throughout the app
export default new RoomService();
