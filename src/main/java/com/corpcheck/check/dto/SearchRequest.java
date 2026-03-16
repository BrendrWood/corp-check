package com.corpcheck.check.dto;

import java.time.LocalDate;
import java.util.List;

public class SearchRequest {
    private String query;
    private String date; // в формате DD.MM.YYYY
    private String scope; // all, number, engineer, comments, checkboxes
    private int page = 0;
    private int size = 100;

    // Геттеры и сеттеры
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    // Конвертация даты
    public LocalDate getParsedDate() {
        if (date == null || date.isEmpty()) return null;
        try {
            String[] parts = date.split("\\.");
            if (parts.length == 3) {
                return LocalDate.of(
                        Integer.parseInt(parts[2]),
                        Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[0])
                );
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }
}