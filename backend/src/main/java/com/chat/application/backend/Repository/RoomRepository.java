package com.chat.application.backend.Repository;

import com.chat.application.backend.Entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

    Room findByRoomId(String roomId); // Method to find a room by its unique roomId
}
