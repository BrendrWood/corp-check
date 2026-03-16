package com.corpcheck.check.repository;

import com.corpcheck.check.model.CorporateApplication;
import com.corpcheck.check.model.enums.ApplicationStatus;
import com.corpcheck.check.model.enums.StageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CorporateApplicationRepository extends JpaRepository<CorporateApplication, Long> {

    // =============== БАЗОВЫЙ ПОИСК ===============
    CorporateApplication findByApplicationNumber(String applicationNumber);

    List<CorporateApplication> findByStatus(ApplicationStatus status);

    @Query("SELECT a FROM CorporateApplication a WHERE a.stageOne.inspector = :inspector OR a.stageTwo.inspector = :inspector")
    List<CorporateApplication> findByInspector(@Param("inspector") String inspector);

    // =============== ПОИСК ПО ДАТАМ ===============
    @Query("SELECT a FROM CorporateApplication a WHERE a.installationDate BETWEEN :startDate AND :endDate")
    List<CorporateApplication> findByInstallationDateRange(@Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    List<CorporateApplication> findByInstallationDate(LocalDate date);

    Page<CorporateApplication> findByInstallationDate(LocalDate date, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE a.stageOne.checkDate = :date OR a.stageTwo.checkDate = :date")
    List<CorporateApplication> findByCheckDate(@Param("date") LocalDate date);

    // НОВЫЙ МЕТОД: Поиск заявок, созданных или обновленных за период
    @Query("SELECT a FROM CorporateApplication a WHERE " +
            "a.createdAt BETWEEN :startOfDay AND :endOfDay OR " +
            "a.lastUpdated BETWEEN :startOfDay AND :endOfDay " +
            "ORDER BY a.lastUpdated DESC")
    List<CorporateApplication> findByProcessedToday(@Param("startOfDay") LocalDateTime startOfDay,
                                                    @Param("endOfDay") LocalDateTime endOfDay);

    // =============== ПОСЛЕДНИЕ ЗАЯВКИ ===============
    @Query("SELECT a FROM CorporateApplication a ORDER BY a.lastUpdated DESC")
    List<CorporateApplication> findRecent(Pageable pageable);

    @Query(value = "SELECT a FROM CorporateApplication a ORDER BY a.lastUpdated DESC",
            countQuery = "SELECT COUNT(a) FROM CorporateApplication a")
    Page<CorporateApplication> findRecentPage(Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE a.status NOT IN :excludedStatuses ORDER BY a.lastUpdated DESC")
    List<CorporateApplication> findRecentExcluding(@Param("excludedStatuses") List<ApplicationStatus> excludedStatuses,
                                                   Pageable pageable);

    // =============== РАСШИРЕННЫЙ ПОИСК ===============

    @Query("SELECT a FROM CorporateApplication a WHERE LOWER(a.applicationNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CorporateApplication> searchByNumber(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE LOWER(a.engineerName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CorporateApplication> searchByEngineer(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE " +
            "LOWER(a.stageOne.comments) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(a.stageTwo.comments) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(a.stageTwo.rentalComment) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CorporateApplication> searchByComments(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE " +
            "a.panelNumberAssigned = true OR " +
            "a.stageOne.panicSignalType = true OR " +
            "a.stageOne.csmPanicSignal = true OR " +
            "a.stageOne.instructionSticker = true OR " +
            "a.stageOne.armingDisarming = true OR " +
            "a.stageOne.backupPower = true OR " +
            "a.stageOne.highCeilings = true OR " +
            "a.stageTwo.equipmentRental = true OR " +
            "a.stageTwo.stickersStandard = true OR " +
            "a.stageTwo.systemPhotos = true OR " +
            "a.stageTwo.form002Filled = true OR " +
            "a.stageTwo.acceptanceCertificate = true OR " +
            "a.stageTwo.defectAct = true OR " +
            "a.stageTwo.accessRoads = true OR " +
            "a.stageTwo.floorPlan = true OR " +
            "a.stageTwo.fireAlarm = true OR " +
            "a.stageTwo.electronicChecklist = true OR " +
            "a.stageTwo.postInstallationIssues = true OR " +
            "a.stageTwo.incompleteForm002 = true")
    Page<CorporateApplication> searchByAnyCheckbox(Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE " +
            "(:field = 'panelNumberAssigned' AND a.panelNumberAssigned = true) OR " +
            "(:field = 'panicSignalType' AND a.stageOne.panicSignalType = true) OR " +
            "(:field = 'csmPanicSignal' AND a.stageOne.csmPanicSignal = true) OR " +
            "(:field = 'instructionSticker' AND a.stageOne.instructionSticker = true) OR " +
            "(:field = 'armingDisarming' AND a.stageOne.armingDisarming = true) OR " +
            "(:field = 'backupPower' AND a.stageOne.backupPower = true) OR " +
            "(:field = 'highCeilings' AND a.stageOne.highCeilings = true) OR " +
            "(:field = 'equipmentRental' AND a.stageTwo.equipmentRental = true) OR " +
            "(:field = 'stickersStandard' AND a.stageTwo.stickersStandard = true) OR " +
            "(:field = 'systemPhotos' AND a.stageTwo.systemPhotos = true) OR " +
            "(:field = 'form002Filled' AND a.stageTwo.form002Filled = true) OR " +
            "(:field = 'acceptanceCertificate' AND a.stageTwo.acceptanceCertificate = true) OR " +
            "(:field = 'defectAct' AND a.stageTwo.defectAct = true) OR " +
            "(:field = 'accessRoads' AND a.stageTwo.accessRoads = true) OR " +
            "(:field = 'floorPlan' AND a.stageTwo.floorPlan = true) OR " +
            "(:field = 'fireAlarm' AND a.stageTwo.fireAlarm = true) OR " +
            "(:field = 'electronicChecklist' AND a.stageTwo.electronicChecklist = true) OR " +
            "(:field = 'postInstallationIssues' AND a.stageTwo.postInstallationIssues = true) OR " +
            "(:field = 'incompleteForm002' AND a.stageTwo.incompleteForm002 = true)")
    Page<CorporateApplication> searchByCheckbox(@Param("field") String field, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE a.installationDate = :date AND (" +
            "a.panelNumberAssigned = true OR a.stageOne.panicSignalType = true OR " +
            "a.stageOne.csmPanicSignal = true OR a.stageOne.instructionSticker = true OR " +
            "a.stageOne.armingDisarming = true OR a.stageOne.backupPower = true OR " +
            "a.stageOne.highCeilings = true OR a.stageTwo.equipmentRental = true OR " +
            "a.stageTwo.stickersStandard = true OR a.stageTwo.systemPhotos = true OR " +
            "a.stageTwo.form002Filled = true OR a.stageTwo.acceptanceCertificate = true OR " +
            "a.stageTwo.defectAct = true OR a.stageTwo.accessRoads = true OR " +
            "a.stageTwo.floorPlan = true OR a.stageTwo.fireAlarm = true OR " +
            "a.stageTwo.electronicChecklist = true OR a.stageTwo.postInstallationIssues = true OR " +
            "a.stageTwo.incompleteForm002 = true)")
    Page<CorporateApplication> searchByDateAndAnyCheckbox(@Param("date") LocalDate date, Pageable pageable);

    @Query("SELECT a FROM CorporateApplication a WHERE a.installationDate = :date AND " +
            "(:field = 'panelNumberAssigned' AND a.panelNumberAssigned = true OR " +
            ":field = 'panicSignalType' AND a.stageOne.panicSignalType = true OR " +
            ":field = 'csmPanicSignal' AND a.stageOne.csmPanicSignal = true OR " +
            ":field = 'instructionSticker' AND a.stageOne.instructionSticker = true OR " +
            ":field = 'armingDisarming' AND a.stageOne.armingDisarming = true OR " +
            ":field = 'backupPower' AND a.stageOne.backupPower = true OR " +
            ":field = 'highCeilings' AND a.stageOne.highCeilings = true OR " +
            ":field = 'equipmentRental' AND a.stageTwo.equipmentRental = true OR " +
            ":field = 'stickersStandard' AND a.stageTwo.stickersStandard = true OR " +
            ":field = 'systemPhotos' AND a.stageTwo.systemPhotos = true OR " +
            ":field = 'form002Filled' AND a.stageTwo.form002Filled = true OR " +
            ":field = 'acceptanceCertificate' AND a.stageTwo.acceptanceCertificate = true OR " +
            ":field = 'defectAct' AND a.stageTwo.defectAct = true OR " +
            ":field = 'accessRoads' AND a.stageTwo.accessRoads = true OR " +
            ":field = 'floorPlan' AND a.stageTwo.floorPlan = true OR " +
            ":field = 'fireAlarm' AND a.stageTwo.fireAlarm = true OR " +
            ":field = 'electronicChecklist' AND a.stageTwo.electronicChecklist = true OR " +
            ":field = 'postInstallationIssues' AND a.stageTwo.postInstallationIssues = true OR " +
            ":field = 'incompleteForm002' AND a.stageTwo.incompleteForm002 = true)")
    Page<CorporateApplication> searchByDateAndCheckbox(@Param("date") LocalDate date,
                                                       @Param("field") String field,
                                                       Pageable pageable);

    // =============== АРХИВНЫЙ ПОИСК ===============
    @Query("SELECT a FROM CorporateApplication a WHERE " +
            "LOWER(a.applicationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.engineerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(CAST(a.installationDate AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.stageOne.inspector) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.stageTwo.inspector) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<CorporateApplication> searchArchive(@Param("search") String search, Pageable pageable);

    // =============== СТАТИСТИКА ===============
    @Query("SELECT COUNT(a) FROM CorporateApplication a WHERE a.stageOne.status = :status")
    long countStageOneByStatus(@Param("status") StageStatus status);

    @Query("SELECT COUNT(a) FROM CorporateApplication a WHERE a.stageTwo.status = :status")
    long countStageTwoByStatus(@Param("status") StageStatus status);

    @Query("SELECT a.stageOne.inspector, COUNT(a) FROM CorporateApplication a GROUP BY a.stageOne.inspector")
    List<Object[]> countByStageOneInspector();

    @Query("SELECT a.stageTwo.inspector, COUNT(a) FROM CorporateApplication a GROUP BY a.stageTwo.inspector")
    List<Object[]> countByStageTwoInspector();

    @Query("SELECT FUNCTION('DATE', a.lastUpdated), COUNT(a) FROM CorporateApplication a GROUP BY FUNCTION('DATE', a.lastUpdated)")
    List<Object[]> countByDay();

    // =============== ПРОВЕРКА СУЩЕСТВОВАНИЯ ===============
    boolean existsByApplicationNumber(String applicationNumber);
}