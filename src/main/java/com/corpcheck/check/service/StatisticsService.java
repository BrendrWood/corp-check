package com.corpcheck.check.service;

import com.corpcheck.check.dto.StatisticsDto;
import com.corpcheck.check.model.enums.StageStatus;
import com.corpcheck.check.repository.CorporateApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private static final Logger log = LoggerFactory.getLogger(StatisticsService.class);

    private final CorporateApplicationRepository applicationRepository;

    @Autowired
    public StatisticsService(CorporateApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public StatisticsDto getStatistics() {
        long total = applicationRepository.count();
        long stage1Ok = applicationRepository.countStageOneByStatus(StageStatus.OK);
        long stage1Nok = applicationRepository.countStageOneByStatus(StageStatus.NOK);
        long stage2Ok = applicationRepository.countStageTwoByStatus(StageStatus.OK);
        long stage2Nok = applicationRepository.countStageTwoByStatus(StageStatus.NOK);

        Map<String, Long> byInspector = new HashMap<>();

        try {
            List<Object[]> stage1Results = applicationRepository.countByStageOneInspector();
            for (Object[] result : stage1Results) {
                if (result.length >= 2 && result[0] != null) {
                    byInspector.put((String) result[0], (Long) result[1]);
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch stage1 inspector stats: {}", e.getMessage());
        }

        try {
            List<Object[]> stage2Results = applicationRepository.countByStageTwoInspector();
            for (Object[] result : stage2Results) {
                if (result.length >= 2 && result[0] != null) {
                    byInspector.merge((String) result[0], (Long) result[1], Long::sum);
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch stage2 inspector stats: {}", e.getMessage());
        }

        Map<String, Long> byDay = new LinkedHashMap<>();
        try {
            List<Object[]> dayResults = applicationRepository.countByDay();
            dayResults.stream()
                    .sorted((a, b) -> ((String) b[0]).compareTo((String) a[0]))
                    .limit(30)
                    .forEach(obj -> {
                        if (obj.length >= 2 && obj[0] != null) {
                            byDay.put((String) obj[0], (Long) obj[1]);
                        }
                    });
        } catch (Exception e) {
            log.warn("Could not fetch daily stats: {}", e.getMessage());
        }

        List<StatisticsDto.EngineerStats> engineerStats = calculateEngineerStats();

        StatisticsDto stats = new StatisticsDto();
        stats.setTotalApplications(total);
        stats.setStage1Ok(stage1Ok);
        stats.setStage1Nok(stage1Nok);
        stats.setStage2Ok(stage2Ok);
        stats.setStage2Nok(stage2Nok);
        stats.setCompletedApplications(stage2Ok);
        stats.setRejectedApplications(stage1Nok + stage2Nok);
        stats.setByInspector(byInspector);
        stats.setByDay(byDay);
        stats.setEngineerStats(engineerStats);

        return stats;
    }

    private List<StatisticsDto.EngineerStats> calculateEngineerStats() {
        // Упрощенная версия без сложных запросов
        List<StatisticsDto.EngineerStats> result = new ArrayList<>();

        try {
            List<Object[]> stage1Results = applicationRepository.countByStageOneInspector();
            for (Object[] res : stage1Results) {
                if (res.length >= 2 && res[0] != null) {
                    StatisticsDto.EngineerStats stats = new StatisticsDto.EngineerStats();
                    stats.setName((String) res[0]);
                    stats.setStage1Checks((Long) res[1]);
                    stats.setStage2Checks(0);
                    stats.setSuccessRate(50.0); // Заглушка
                    result.add(stats);
                }
            }
        } catch (Exception e) {
            log.warn("Could not calculate engineer stats: {}", e.getMessage());
        }

        return result;
    }
}