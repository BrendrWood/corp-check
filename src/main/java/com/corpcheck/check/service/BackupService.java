package com.corpcheck.check.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${backup.path:backups}")
    private String backupPath;

    @Value("${backup.retention.days:30}")
    private int retentionDays;

    @Scheduled(cron = "0 0 2 * * ?")
    public void dailyBackup() {
        log.info("Starting daily backup at {}", LocalDateTime.now());

        try {
            Path backupDir = Paths.get(backupPath);
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }

            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"));
            String fileName = "backup_" + timestamp + ".zip";
            Path backupFile = backupDir.resolve(fileName);

            performBackup(backupFile);
            cleanupOldBackups();

            log.info("Backup completed: {}", backupFile);

        } catch (Exception e) {
            log.error("Backup failed: {}", e.getMessage(), e);
        }
    }

    private void performBackup(Path backupFile) {
        if (dbUrl.contains("h2")) {
            performH2Backup(backupFile);
        } else if (dbUrl.contains("postgresql")) {
            performPostgresBackup(backupFile);
        }
    }

    private void performH2Backup(Path backupFile) {
        try {
            Class.forName("org.h2.Driver");
            String url = dbUrl + ";BACKUP_TO='" + backupFile.toAbsolutePath() + "'";
            java.sql.DriverManager.getConnection(url, dbUser, dbPassword).close();
        } catch (Exception e) {
            throw new RuntimeException("H2 backup failed", e);
        }
    }

    private void performPostgresBackup(Path backupFile) {
        try {
            String dbName = extractDbName(dbUrl);
            ProcessBuilder pb = new ProcessBuilder(
                    "pg_dump",
                    "-h", "localhost",
                    "-U", dbUser,
                    "-d", dbName,
                    "-f", backupFile.toString()
            );
            pb.environment().put("PGPASSWORD", dbPassword);

            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new RuntimeException("pg_dump failed with exit code: " + exitCode);
            }
        } catch (Exception e) {
            throw new RuntimeException("PostgreSQL backup failed", e);
        }
    }

    private String extractDbName(String url) {
        int lastSlash = url.lastIndexOf('/');
        int lastParam = url.indexOf('?');
        if (lastParam == -1) {
            return url.substring(lastSlash + 1);
        } else {
            return url.substring(lastSlash + 1, lastParam);
        }
    }

    private void cleanupOldBackups() throws IOException {
        Path backupDir = Paths.get(backupPath);
        if (!Files.exists(backupDir)) return;

        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);

        try (Stream<Path> files = Files.list(backupDir)) {
            files.filter(path -> path.toString().endsWith(".zip"))
                    .filter(path -> {
                        try {
                            return Files.getLastModifiedTime(path)
                                    .toInstant()
                                    .atZone(java.time.ZoneId.systemDefault())
                                    .toLocalDateTime()
                                    .isBefore(cutoff);
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                            log.info("Deleted old backup: {}", path);
                        } catch (IOException e) {
                            log.error("Failed to delete old backup: {}", path);
                        }
                    });
        }
    }

    public void createManualBackup() {
        dailyBackup();
    }
}