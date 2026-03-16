package com.corpcheck.check.controller;

import com.corpcheck.check.dto.SearchRequest;
import com.corpcheck.check.dto.SearchResult;
import com.corpcheck.check.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/corp/applications/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @PostMapping
    public ResponseEntity<SearchResult> search(@RequestBody SearchRequest request) {
        try {
            SearchResult result = searchService.search(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/checkboxes")
    public ResponseEntity<Map<String, String>> getCheckboxKeywords() {
        Map<String, String> keywords = new HashMap<>();
        keywords.put("аренда", "Поиск заявок с отмеченной арендой");
        keywords.put("деф.акт", "Поиск заявок с отмеченным дефектным актом");
        keywords.put("наклейка", "Поиск заявок с отмеченной наклейкой");
        keywords.put("фото объекта", "Поиск заявок с фото объекта");
        keywords.put("форма 002", "Поиск заявок с заполненной формой 002");
        keywords.put("пути", "Поиск заявок с подъездными путями");
        keywords.put("план", "Поиск заявок с поэтажным планом");
        keywords.put("пс", "Поиск заявок с пожарной сигнализацией");
        keywords.put("авр", "Поиск заявок с актом выполненных работ");
        keywords.put("эл.чек-лист", "Поиск заявок с электронным чек-листом");
        keywords.put("неисправности", "Поиск заявок с неисправностями");
        keywords.put("пультовой", "Поиск заявок с прописанным пультовым");
        keywords.put("ктс", "Поиск заявок с сигналами КТС");
        keywords.put("цсм", "Поиск заявок с прохождением на ЦСМ");
        keywords.put("инструкция", "Поиск заявок с наклеенной инструкцией");
        keywords.put("пост/снятие", "Поиск заявок с постановкой/снятием без тревог");
        keywords.put("резервное", "Поиск заявок с резервным питанием");
        keywords.put("потолки", "Поиск заявок с высокими потолками");

        return ResponseEntity.ok(keywords);
    }
}