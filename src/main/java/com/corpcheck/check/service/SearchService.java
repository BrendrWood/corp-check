package com.corpcheck.check.service;

import com.corpcheck.check.dto.ApplicationSummaryDto;
import com.corpcheck.check.dto.SearchRequest;
import com.corpcheck.check.dto.SearchResult;
import com.corpcheck.check.model.CorporateApplication;
import com.corpcheck.check.repository.CorporateApplicationRepository;
import com.corpcheck.check.util.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    @Autowired
    private CorporateApplicationRepository applicationRepository;

    @Autowired
    private DtoMapper mapper;

    // Маппинг ключевых слов на поля в БД
    private static final Map<String, String> CHECKBOX_MAPPING = new HashMap<>();

    static {
        CHECKBOX_MAPPING.put("аренда", "equipmentRental");
        CHECKBOX_MAPPING.put("деф.акт", "defectAct");
        CHECKBOX_MAPPING.put("дефектный акт", "defectAct");
        CHECKBOX_MAPPING.put("наклейка", "stickersStandard");
        CHECKBOX_MAPPING.put("фото объекта", "systemPhotos");
        CHECKBOX_MAPPING.put("форма 002", "form002Filled");
        CHECKBOX_MAPPING.put("подъездные пути", "accessRoads");
        CHECKBOX_MAPPING.put("пути", "accessRoads");
        CHECKBOX_MAPPING.put("план", "floorPlan");
        CHECKBOX_MAPPING.put("пс", "fireAlarm");
        CHECKBOX_MAPPING.put("авр", "acceptanceCertificate");
        CHECKBOX_MAPPING.put("эл.чек-лист", "electronicChecklist");
        CHECKBOX_MAPPING.put("неисправности", "postInstallationIssues");
        CHECKBOX_MAPPING.put("неполная форма", "incompleteForm002");
        CHECKBOX_MAPPING.put("пультовой", "panelNumberAssigned");
        CHECKBOX_MAPPING.put("ктс", "panicSignalType");
        CHECKBOX_MAPPING.put("цсм", "csmPanicSignal");
        CHECKBOX_MAPPING.put("инструкция", "instructionSticker");
        CHECKBOX_MAPPING.put("пост/снятие", "armingDisarming");
        CHECKBOX_MAPPING.put("резервное", "backupPower");
        CHECKBOX_MAPPING.put("потолки", "highCeilings");
    }

    @Transactional(readOnly = true)
    public SearchResult search(SearchRequest request) {
        log.info("Выполнение поиска: query={}, date={}, scope={}, page={}, size={}",
                request.getQuery(), request.getDate(), request.getScope(),
                request.getPage(), request.getSize());

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.by(Sort.Direction.DESC, "installationDate")
        );

        Page<CorporateApplication> page;
        LocalDate parsedDate = request.getParsedDate();
        String query = request.getQuery() != null ? request.getQuery().toLowerCase().trim() : "";

        // Определяем, является ли запрос ключевым словом для чек-бокса
        String checkboxField = findCheckboxField(query);

        if (parsedDate != null) {
            // Поиск с датой
            if (checkboxField != null) {
                // По дате и конкретному чек-боксу
                page = applicationRepository.searchByDateAndCheckbox(parsedDate, checkboxField, pageable);
            } else if (!query.isEmpty()) {
                // По дате и тексту
                page = applicationRepository.searchArchive(query, pageable);
            } else {
                // Только по дате
                page = applicationRepository.findByInstallationDate(parsedDate, pageable);
            }
        } else if (checkboxField != null) {
            // Поиск по конкретному чек-боксу
            page = applicationRepository.searchByCheckbox(checkboxField, pageable);
        } else if (!query.isEmpty()) {
            // Поиск по тексту во всех полях
            page = applicationRepository.searchArchive(query, pageable);
        } else {
            // Пустой запрос - возвращаем последние
            page = applicationRepository.findRecentPage(pageable);
        }

        var results = page.getContent().stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());

        return new SearchResult(results, page.getTotalElements(),
                request.getPage(), request.getSize(), request);
    }

    private String findCheckboxField(String query) {
        if (query == null || query.isEmpty()) return null;

        for (Map.Entry<String, String> entry : CHECKBOX_MAPPING.entrySet()) {
            if (query.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }
}