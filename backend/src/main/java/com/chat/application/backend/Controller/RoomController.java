package com.chat.application.backend.Controller;

import com.chat.application.backend.Entity.Message;
import com.chat.application.backend.Entity.Room;
import com.chat.application.backend.Service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody String RoomId) {

        return ResponseEntity.ok(roomService.createRoom(RoomId));
    }

    @GetMapping("/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.joinRoom(roomId));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String roomId){

        List<Message> messages = roomService.getMessages(roomId);
        return ResponseEntity.ok().body(messages);
    }
}
