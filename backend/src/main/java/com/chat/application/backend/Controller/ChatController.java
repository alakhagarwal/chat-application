package com.chat.application.backend.Controller;

import com.chat.application.backend.Entity.Message;
import com.chat.application.backend.Entity.Room;
import com.chat.application.backend.Exception.RoomNotFoundException;
import com.chat.application.backend.Payload.MessageRequest;
import com.chat.application.backend.Repository.RoomRepository;
import com.chat.application.backend.Service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final RoomService roomService;
    private final RoomRepository roomRepository;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ) {
        Room room = roomService.findByRoomId(request.getRoomId());

        Message message = new Message();
        message.setSender(request.getSender());
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());

        if (room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);
        } else {
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist.");
        }

        return message;
    }
}
