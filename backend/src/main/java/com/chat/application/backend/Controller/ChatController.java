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

    // for sending and receiving messages, we will use WebSocket, so we don't need to define any REST endpoints here for that purpose. The WebSocket endpoints are defined in the WebSocketConfig class.

    @MessageMapping("/sendMessage/{roomId}") // chat/sendMessage/{roomId} is the destination for sending messages to the server. Clients will send messages to this destination, and the server will process them using the sendMessage method.
    @SendTo("topic/room/{roomId}") // subscribe to this topic to receive messages for the specific room
    public Message sendMessage(
            @DestinationVariable String roomId, // This annotation indicates that the roomId variable should be extracted from the destination path. For example, if a message is sent to "/sendMessage/123", the roomId variable will be set to "123".
            @RequestBody MessageRequest request
    ) {
        // This method will be called when a message is sent from the client to the server via WebSocket.
        // The message will be processed and then broadcasted to all clients subscribed to the relevant topic.

        Room room = roomService.findByRoomId(request.getRoomId()); // Find the room by its ID using the RoomService.

        Message message = new Message(); // Create a new Message object.
        message.setSender(request.getSender()); // Set the sender of the message.
        message.setContent(request.getContent()); // Set the content of the message.
        message.setTimestamp(LocalDateTime.now()); // Set the timestamp of the message to the current time.

        if (room != null) {
            room.getMessages().add(message); // Add the message to the room's list of messages.
            roomService.joinRoom(roomId); // Update the room in the database to reflect the new message.
        }else{
            throw new RoomNotFoundException("Room with ID " + roomId + " does not exist."); // If the room is not found, throw a RoomNotFoundException.
        }


        return message; // Return the message, which will be sent to all clients subscribed to "topic/room/{roomId}".

    }


}
