package com.corpcheck.check.repository;

import com.corpcheck.check.model.ChatMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    @Query("SELECT c FROM ChatMessageEntity c ORDER BY c.timestamp DESC")
    List<ChatMessageEntity> findLastMessages(Pageable pageable);
}