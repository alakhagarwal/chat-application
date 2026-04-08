package com.chat.application.backend.Exception;

public class DuplicateRoomException extends RuntimeException {

    public DuplicateRoomException(String message) {
        super(message);
    }
}

