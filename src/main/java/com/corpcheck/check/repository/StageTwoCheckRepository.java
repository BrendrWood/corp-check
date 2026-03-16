package com.corpcheck.check.repository;

import com.corpcheck.check.model.StageTwoCheck;
import com.corpcheck.check.model.enums.FireAlarmChecklistStatus;
import com.corpcheck.check.model.enums.StageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StageTwoCheckRepository extends JpaRepository<StageTwoCheck, Long> {

    List<StageTwoCheck> findByInspector(String inspector);

    List<StageTwoCheck> findByStatus(StageStatus status);

    List<StageTwoCheck> findByFireAlarmChecklist(FireAlarmChecklistStatus status);

    List<StageTwoCheck> findByCheckDate(LocalDate date);

    @Query("SELECT s FROM StageTwoCheck s WHERE s.equipmentRental = true")
    List<StageTwoCheck> findWithEquipmentRental();

    @Query("SELECT s FROM StageTwoCheck s WHERE s.postInstallationIssues = true")
    List<StageTwoCheck> findWithIssues();

    @Query("SELECT COUNT(s) FROM StageTwoCheck s WHERE s.fireAlarm = true")
    long countWithFireAlarm();

    @Query("SELECT s.inspector, COUNT(s) FROM StageTwoCheck s GROUP BY s.inspector")
    List<Object[]> countByInspector();
}