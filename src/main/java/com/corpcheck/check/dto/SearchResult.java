package com.corpcheck.check.dto;

import java.util.List;

public class SearchResult {
    private List<ApplicationSummaryDto> results;
    private long totalCount;
    private int page;
    private int size;
    private SearchRequest originalRequest;

    public SearchResult() {}

    public SearchResult(List<ApplicationSummaryDto> results, long totalCount,
                        int page, int size, SearchRequest originalRequest) {
        this.results = results;
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.originalRequest = originalRequest;
    }

    // Геттеры и сеттеры
    public List<ApplicationSummaryDto> getResults() { return results; }
    public void setResults(List<ApplicationSummaryDto> results) { this.results = results; }

    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public SearchRequest getOriginalRequest() { return originalRequest; }
    public void setOriginalRequest(SearchRequest originalRequest) { this.originalRequest = originalRequest; }
}