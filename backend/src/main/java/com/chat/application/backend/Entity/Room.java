package com.chat.application.backend.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {
    @Id
    private String id; // MongoDB will automatically generate a unique ID for each document

    private String roomId; // Unique identifier for the chat room for creater to share

    private List<Message> messages = new ArrayList<>(); // List of messages in the chat room
}
