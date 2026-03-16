package com.corpcheck.check.repository;

import com.corpcheck.check.model.StageOneCheck;
import com.corpcheck.check.model.enums.StageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StageOneCheckRepository extends JpaRepository<StageOneCheck, Long> {

    List<StageOneCheck> findByInspector(String inspector);

    List<StageOneCheck> findByStatus(StageStatus status);

    List<StageOneCheck> findByCheckDate(LocalDate date);

    @Query("SELECT s FROM StageOneCheck s WHERE s.checkDate BETWEEN :startDate AND :endDate")
    List<StageOneCheck> findByDateRange(@Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM StageOneCheck s WHERE s.gsmLevel LIKE %:level%")
    List<StageOneCheck> findByGsmLevelContaining(@Param("level") String level);

    long countByInspector(String inspector);

    // Удаляем проблемный метод или комментируем
    // @Query("SELECT AVG(s.gsmLevel) FROM StageOneCheck s WHERE s.gsmLevel IS NOT NULL")
    // Double averageGsmLevel();
}