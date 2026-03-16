package com.corpcheck.check.service;

import com.corpcheck.check.model.ChatMessageEntity;
import com.corpcheck.check.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final int MAX_MESSAGES = 50;

    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Transactional
    public ChatMessageEntity addMessage(String username, String message) {
        log.info("Saving message from {}: {}", username, message);

        ChatMessageEntity chatMessage = new ChatMessageEntity(username, message);
        ChatMessageEntity saved = chatMessageRepository.save(chatMessage);

        // Удаляем старые сообщения, если их больше MAX_MESSAGES
        cleanupOldMessages();

        log.info("Message saved with id: {}", saved.getId());
        return saved;
    }

    @Transactional
    public void cleanupOldMessages() {
        long count = chatMessageRepository.count();
        if (count > MAX_MESSAGES) {
            Pageable pageable = PageRequest.of(0, (int)(count - MAX_MESSAGES), Sort.by(Sort.Direction.ASC, "timestamp"));
            List<ChatMessageEntity> oldMessages = chatMessageRepository.findLastMessages(pageable);
            chatMessageRepository.deleteAll(oldMessages);
            log.info("Cleaned up {} old messages", oldMessages.size());
        }
    }

    @Transactional(readOnly = true)
    public List<ChatMessageEntity> getLastMessages(int count) {
        Pageable pageable = PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<ChatMessageEntity> messages = chatMessageRepository.findLastMessages(pageable);

        // Возвращаем в хронологическом порядке (от старых к новым)
        List<ChatMessageEntity> sorted = messages.stream()
                .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
                .collect(Collectors.toList());

        log.info("Returning {} messages from database", sorted.size());
        return sorted;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageEntity> getAllMessages() {
        return getLastMessages(MAX_MESSAGES);
    }
}