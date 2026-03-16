package com.corpcheck.check.dto;

import java.util.List;
import java.util.Map;

public class StatisticsDto {
    private long totalApplications;
    private long stage1Ok;
    private long stage1Nok;
    private long stage2Ok;
    private long stage2Nok;
    private long completedApplications;
    private long rejectedApplications;

    private Map<String, Long> byInspector;
    private Map<String, Long> byDay;
    private List<EngineerStats> engineerStats;

    public StatisticsDto() {
    }

    // Getters and Setters
    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getStage1Ok() { return stage1Ok; }
    public void setStage1Ok(long stage1Ok) { this.stage1Ok = stage1Ok; }

    public long getStage1Nok() { return stage1Nok; }
    public void setStage1Nok(long stage1Nok) { this.stage1Nok = stage1Nok; }

    public long getStage2Ok() { return stage2Ok; }
    public void setStage2Ok(long stage2Ok) { this.stage2Ok = stage2Ok; }

    public long getStage2Nok() { return stage2Nok; }
    public void setStage2Nok(long stage2Nok) { this.stage2Nok = stage2Nok; }

    public long getCompletedApplications() { return completedApplications; }
    public void setCompletedApplications(long completedApplications) { this.completedApplications = completedApplications; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

    public Map<String, Long> getByInspector() { return byInspector; }
    public void setByInspector(Map<String, Long> byInspector) { this.byInspector = byInspector; }

    public Map<String, Long> getByDay() { return byDay; }
    public void setByDay(Map<String, Long> byDay) { this.byDay = byDay; }

    public List<EngineerStats> getEngineerStats() { return engineerStats; }
    public void setEngineerStats(List<EngineerStats> engineerStats) { this.engineerStats = engineerStats; }

    public static class EngineerStats {
        private String name;
        private long stage1Checks;
        private long stage2Checks;
        private double successRate;
        private int rank;

        public EngineerStats() {
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getStage1Checks() { return stage1Checks; }
        public void setStage1Checks(long stage1Checks) { this.stage1Checks = stage1Checks; }

        public long getStage2Checks() { return stage2Checks; }
        public void setStage2Checks(long stage2Checks) { this.stage2Checks = stage2Checks; }

        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
    }
}