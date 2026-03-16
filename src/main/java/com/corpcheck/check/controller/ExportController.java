package com.corpcheck.check.controller;

import com.corpcheck.check.dto.ApplicationSummaryDto;
import com.corpcheck.check.service.CorporateApplicationService;
import com.corpcheck.check.service.ExcelExportService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/corp/applications/export")
public class ExportController {

    @Autowired
    private CorporateApplicationService applicationService;

    @Autowired
    private ExcelExportService excelExportService;

    @Autowired
    private ObjectMapper objectMapper;

    // Метод exportSingle УДАЛЕН

    @GetMapping("/date/{dateStr}")
    public void exportByDate(@PathVariable String dateStr, HttpServletResponse response) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            LocalDate date = LocalDate.parse(dateStr, formatter);

            List<ApplicationSummaryDto> applications = applicationService.findByDate(date);
            String filename = "zayavki_za_" + dateStr + ".xlsx";
            excelExportService.exportToExcel(applications, response, filename);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        }
    }

    @PostMapping("/search")
    public void exportSearchResults(@RequestParam("ids") String idsStr, HttpServletResponse response) {
        try {
            List<Long> ids = objectMapper.readValue(idsStr, new TypeReference<List<Long>>() {});
            List<ApplicationSummaryDto> applications = applicationService.findByIds(ids);
            String filename = "resultaty_poiska_" +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) + ".xlsx";
            excelExportService.exportToExcel(applications, response, filename);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        }
    }

    @GetMapping("/today")
    public void exportToday(HttpServletResponse response) {
        try {
            LocalDate today = LocalDate.now();
            List<ApplicationSummaryDto> applications = applicationService.findByDate(today);
            String filename = "zayavki_za_segodnya_" +
                    today.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) + ".xlsx";
            excelExportService.exportToExcel(applications, response, filename);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        }
    }

    // НОВЫЙ МЕТОД: Экспорт заявок, обработанных сегодня (созданных или обновленных)
    @GetMapping("/processed-today")
    public void exportProcessedToday(HttpServletResponse response) {
        try {
            LocalDate today = LocalDate.now();
            List<ApplicationSummaryDto> applications = applicationService.findProcessedToday();
            String filename = "applications_processed_today_" +
                    today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
            excelExportService.exportToExcel(applications, response, filename);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        }
    }
}