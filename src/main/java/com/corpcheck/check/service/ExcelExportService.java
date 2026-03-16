package com.corpcheck.check.service;

import com.corpcheck.check.dto.ApplicationSummaryDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelExportService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public void exportToExcel(List<ApplicationSummaryDto> applications, HttpServletResponse response, String filename) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        exportToExcel(applications, response.getOutputStream());
    }

    public void exportToExcel(List<ApplicationSummaryDto> applications, OutputStream outputStream) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Заявки");

            // Стили
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle centerStyle = createCenterStyle(workbook);
            CellStyle textStyle = createTextStyle(workbook);

            // Заголовки как в вашем оригинальном ExportController
            String[] headers = {
                    "№ п/п", "Заявка", "Исполнитель", "Пультовой прописан",
                    "IMEI", "Уровень GSM", "Фото уровня связи", "КТС 120/122",
                    "Сигналы КТС на ЦСМ", "Наклеена инструкция", "Пост/снятие",
                    "Резервное питание", "Высокие потолки", "Дата монтажа",
                    "Дата ОП1", "Проверяющий ОП1", "Комментарий ОП1", "Статус ОП1",
                    "Аренда", "Комментарий аренды", "Наклейка",
                    "Фото объекта, КП, КЛ, СИМ", "Форма 002", "Подъездные пути",
                    "План", "ПС", "Чек-лист ПС", "АВР", "Деф.акт",
                    "Эл.чек-лист", "Неисправности после монтажа", "Неполная форма 002",
                    "Дата ОП2", "Проверяющий ОП2", "Комментарий ОП2", "Статус ОП2"
            };

            // Создаем заголовки
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Заполняем данные
            int rowNum = 1;
            for (ApplicationSummaryDto app : applications) {
                Row row = sheet.createRow(rowNum++);
                int col = 0;

                // № п/п
                row.createCell(col++).setCellValue(rowNum - 1);

                // Заявка
                row.createCell(col++).setCellValue(app.getApplicationNumber() != null ? app.getApplicationNumber() : "");

                // Исполнитель
                row.createCell(col++).setCellValue(app.getEngineerName() != null ? app.getEngineerName() : "");

                // Пультовой прописан
                Cell panelAssignedCell = row.createCell(col++);
                panelAssignedCell.setCellValue(app.isPanelNumberAssigned() ? "да" : "нет");
                panelAssignedCell.setCellStyle(centerStyle);

                // IMEI
                row.createCell(col++).setCellValue(app.getPanelSerial() != null ? app.getPanelSerial() : "");

                // Уровень GSM
                row.createCell(col++).setCellValue(app.getStage1GsmLevel() != null ? app.getStage1GsmLevel() : "");

                // Фото уровня связи
                String sensorPhoto = app.getStage1SensorConnectionPhoto();
                Cell photoCell = row.createCell(col++);
                if ("true".equals(sensorPhoto)) {
                    photoCell.setCellValue("да");
                } else if ("false".equals(sensorPhoto)) {
                    photoCell.setCellValue("нет");
                } else if ("wired".equals(sensorPhoto)) {
                    photoCell.setCellValue("проводная");
                } else {
                    photoCell.setCellValue("");
                }
                photoCell.setCellStyle(centerStyle);

                // КТС 120/122
                Cell ktsCell = row.createCell(col++);
                ktsCell.setCellValue(app.getStage1PanicSignalType() != null && app.getStage1PanicSignalType() ? "да" : "нет");
                ktsCell.setCellStyle(centerStyle);

                // Сигналы КТС на ЦСМ
                Cell csmCell = row.createCell(col++);
                csmCell.setCellValue(app.getStage1CsmPanicSignal() != null && app.getStage1CsmPanicSignal() ? "да" : "нет");
                csmCell.setCellStyle(centerStyle);

                // Наклеена инструкция
                Cell instructionCell = row.createCell(col++);
                instructionCell.setCellValue(app.getStage1InstructionSticker() != null && app.getStage1InstructionSticker() ? "да" : "нет");
                instructionCell.setCellStyle(centerStyle);

                // Пост/снятие
                Cell armingCell = row.createCell(col++);
                armingCell.setCellValue(app.getStage1ArmingDisarming() != null && app.getStage1ArmingDisarming() ? "да" : "нет");
                armingCell.setCellStyle(centerStyle);

                // Резервное питание
                Cell backupCell = row.createCell(col++);
                backupCell.setCellValue(app.getStage1BackupPower() != null && app.getStage1BackupPower() ? "да" : "нет");
                backupCell.setCellStyle(centerStyle);

                // Высокие потолки
                Cell ceilingsCell = row.createCell(col++);
                ceilingsCell.setCellValue(app.getStage1HighCeilings() != null && app.getStage1HighCeilings() ? "да" : "нет");
                ceilingsCell.setCellStyle(centerStyle);

                // Дата монтажа
                Cell installDateCell = row.createCell(col++);
                if (app.getInstallationDate() != null) {
                    installDateCell.setCellValue(app.getInstallationDate().format(DATE_FORMATTER));
                    installDateCell.setCellStyle(dateStyle);
                }

                // Дата ОП1
                Cell stage1DateCell = row.createCell(col++);
                if (app.getStage1CheckDate() != null) {
                    stage1DateCell.setCellValue(app.getStage1CheckDate().format(DATE_FORMATTER));
                    stage1DateCell.setCellStyle(dateStyle);
                }

                // Проверяющий ОП1
                row.createCell(col++).setCellValue(app.getStage1Inspector() != null ? app.getStage1Inspector() : "");

                // Комментарий ОП1
                row.createCell(col++).setCellValue(app.getStage1Comments() != null ? app.getStage1Comments() : "");

                // Статус ОП1
                Cell status1Cell = row.createCell(col++);
                status1Cell.setCellValue(app.getStage1Status() != null ? app.getStage1Status().toString() : "");
                status1Cell.setCellStyle(centerStyle);

                // Аренда
                Cell rentalCell = row.createCell(col++);
                rentalCell.setCellValue(app.getStage2EquipmentRental() != null && app.getStage2EquipmentRental() ? "да" : "нет");
                rentalCell.setCellStyle(centerStyle);

                // Комментарий аренды
                row.createCell(col++).setCellValue(app.getStage2RentalComment() != null ? app.getStage2RentalComment() : "");

                // Наклейка
                Cell stickerCell = row.createCell(col++);
                stickerCell.setCellValue(app.getStage2StickersStandard() != null && app.getStage2StickersStandard() ? "да" : "нет");
                stickerCell.setCellStyle(centerStyle);

                // Фото объекта, КП, КЛ, СИМ
                Cell photosCell = row.createCell(col++);
                photosCell.setCellValue(app.getStage2SystemPhotos() != null && app.getStage2SystemPhotos() ? "да" : "нет");
                photosCell.setCellStyle(centerStyle);

                // Форма 002
                Cell formCell = row.createCell(col++);
                formCell.setCellValue(app.getStage2Form002Filled() != null && app.getStage2Form002Filled() ? "да" : "нет");
                formCell.setCellStyle(centerStyle);

                // Подъездные пути
                Cell roadsCell = row.createCell(col++);
                roadsCell.setCellValue(app.getStage2AccessRoads() != null && app.getStage2AccessRoads() ? "да" : "нет");
                roadsCell.setCellStyle(centerStyle);

                // План
                Cell planCell = row.createCell(col++);
                planCell.setCellValue(app.getStage2FloorPlan() != null && app.getStage2FloorPlan() ? "да" : "нет");
                planCell.setCellStyle(centerStyle);

                // ПС
                Cell fireAlarmCell = row.createCell(col++);
                fireAlarmCell.setCellValue(app.getStage2FireAlarm() != null && app.getStage2FireAlarm() ? "да" : "нет");
                fireAlarmCell.setCellStyle(centerStyle);

                // Чек-лист ПС
                String checklist = app.getStage2FireAlarmChecklist();
                if ("YES".equals(checklist)) {
                    row.createCell(col++).setCellValue("Да");
                } else if ("NO".equals(checklist)) {
                    row.createCell(col++).setCellValue("Нет");
                } else if ("GOS_MONTAZH".equals(checklist)) {
                    row.createCell(col++).setCellValue("Монтаж ГОС");
                } else {
                    row.createCell(col++).setCellValue("");
                }

                // АВР
                Cell avrCell = row.createCell(col++);
                avrCell.setCellValue(app.getStage2AcceptanceCertificate() != null && app.getStage2AcceptanceCertificate() ? "да" : "нет");
                avrCell.setCellStyle(centerStyle);

                // Деф.акт
                Cell defectCell = row.createCell(col++);
                defectCell.setCellValue(app.getStage2DefectAct() != null && app.getStage2DefectAct() ? "да" : "нет");
                defectCell.setCellStyle(centerStyle);

                // Эл.чек-лист
                Cell electronicCell = row.createCell(col++);
                electronicCell.setCellValue(app.getStage2ElectronicChecklist() != null && app.getStage2ElectronicChecklist() ? "да" : "нет");
                electronicCell.setCellStyle(centerStyle);

                // Неисправности после монтажа
                Cell issuesCell = row.createCell(col++);
                issuesCell.setCellValue(app.getStage2PostInstallationIssues() != null && app.getStage2PostInstallationIssues() ? "да" : "нет");
                issuesCell.setCellStyle(centerStyle);

                // Неполная форма 002
                Cell incompleteCell = row.createCell(col++);
                incompleteCell.setCellValue(app.getStage2IncompleteForm002() != null && app.getStage2IncompleteForm002() ? "да" : "нет");
                incompleteCell.setCellStyle(centerStyle);

                // Дата ОП2
                Cell stage2DateCell = row.createCell(col++);
                if (app.getStage2CheckDate() != null) {
                    stage2DateCell.setCellValue(app.getStage2CheckDate().format(DATE_FORMATTER));
                    stage2DateCell.setCellStyle(dateStyle);
                }

                // Проверяющий ОП2
                row.createCell(col++).setCellValue(app.getStage2Inspector() != null ? app.getStage2Inspector() : "");

                // Комментарий ОП2
                row.createCell(col++).setCellValue(app.getStage2Comments() != null ? app.getStage2Comments() : "");

                // Статус ОП2
                Cell status2Cell = row.createCell(col++);
                status2Cell.setCellValue(app.getStage2Status() != null ? app.getStage2Status().toString() : "");
                status2Cell.setCellStyle(centerStyle);
            }

            // Устанавливаем ширину колонок как в примере
            setColumnWidths(sheet);

            // Закрепляем заголовок
            sheet.createFreezePane(0, 1);

            // Записываем в выходной поток
            workbook.write(outputStream);

        } catch (IOException e) {
            log.error("Ошибка при создании Excel файла", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCenterStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTextStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private void setColumnWidths(Sheet sheet) {
        // Ширина колонок как в примере (в символах)
        int[] widths = {
                8,   // № п/п
                15,  // Заявка
                15,  // Исполнитель
                12,  // Пультовой прописан
                15,  // IMEI
                10,  // Уровень GSM
                12,  // Фото уровня связи
                10,  // КТС 120/122
                12,  // Сигналы КТС на ЦСМ
                12,  // Наклеена инструкция
                10,  // Пост/снятие
                12,  // Резервное питание
                10,  // Высокие потолки
                12,  // Дата монтажа
                12,  // Дата ОП1
                15,  // Проверяющий ОП1
                20,  // Комментарий ОП1
                10,  // Статус ОП1
                8,   // Аренда
                20,  // Комментарий аренды
                10,  // Наклейка
                20,  // Фото объекта, КП, КЛ, СИМ
                10,  // Форма 002
                12,  // Подъездные пути
                10,  // План
                8,   // ПС
                12,  // Чек-лист ПС
                8,   // АВР
                8,   // Деф.акт
                10,  // Эл.чек-лист
                15,  // Неисправности после монтажа
                12,  // Неполная форма 002
                12,  // Дата ОП2
                15,  // Проверяющий ОП2
                20,  // Комментарий ОП2
                10   // Статус ОП2
        };

        for (int i = 0; i < widths.length; i++) {
            sheet.setColumnWidth(i, widths[i] * 256);
        }
    }
}