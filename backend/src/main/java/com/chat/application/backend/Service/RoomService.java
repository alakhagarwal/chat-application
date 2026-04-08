package com.chat.application.backend.Service;

import com.chat.application.backend.Entity.Message;
import com.chat.application.backend.Exception.DuplicateRoomException;
import com.chat.application.backend.Exception.RoomNotFoundException;
import com.chat.application.backend.Entity.Room;
import com.chat.application.backend.Repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;


    public Room createRoom(String RoomId) {
        if (roomRepository.findByRoomId(RoomId) != null) {
            throw new DuplicateRoomException("Room with ID " + RoomId + " already exists.");
        }

        Room room = new Room();
        room.setRoomId(RoomId);
        return roomRepository.save(room);

    }

    public Room joinRoom(String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist.");
        }
        return room;
    }

    public List<Message> getMessages(String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist.");
        }
        return room.getMessages();
    }
}
